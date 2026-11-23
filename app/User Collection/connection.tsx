import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import clientPromise from "../../authDbConnection/mongo/page";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { User, Library, MovieReview, Review, ShowReview } from "../Constants/constants";

let client: MongoClient | undefined;
let db: Db | undefined;
let users: Collection<User> | undefined;

async function init(): Promise<void> {
  if (db) return;
  try {
    client = await clientPromise;
    db = client.db();
    users = db.collection("users");
    await users.createIndex({ email: 1 }, { unique: true });
    await users.createIndex({ username: 1 }, { unique: true, sparse: true });
    await users.createIndex({ verificationToken: 1 }, { sparse: true });
  } catch (error) {
    console.error("Error during initialization:", error);
    throw new Error("Failed to establish connection to database");
  }
}

// Errors whose message is safe to show to the user, with the HTTP status to use
export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

// Emails are compared case-insensitively (John@Gmail.com === john@gmail.com)
const CASE_INSENSITIVE = { collation: { locale: "en", strength: 2 } };
export const normalizeEmail = (email: string) => (email || "").trim().toLowerCase();

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  github: "GitHub",
  credentials: "email & password",
};
export const providerLabel = (provider?: string) =>
  PROVIDER_LABELS[provider || "credentials"] ?? provider ?? "another provider";

// Signup with email & password. `password` is the plain password; it is hashed here.
export const addUser = async (data: User) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  const username = (data.username || "").trim();
  const email = normalizeEmail(data.email);
  const hashedPassword = await bcrypt.hash(data.password || "", 10);

  const existing = await users.findOne({ email }, CASE_INSENSITIVE);
  if (existing) {
    const provider = existing.provider || "credentials";
    if (provider !== "credentials") {
      throw new AuthError(
        `This email is already registered with ${providerLabel(provider)}. Please sign in with ${providerLabel(provider)} instead.`,
        409
      );
    }
    if (!existing.isVerified) {
      // Unfinished signup: send a fresh verification link instead of failing
      const verificationToken = crypto.randomBytes(32).toString("hex");
      await users.updateOne(
        { _id: existing._id },
        { $set: { verificationToken, verificationExpires: tokenExpiry() } }
      );
      try {
        await sendVerificationEmail(email, verificationToken);
      } catch (error) {
        console.error("Failed to resend verification email:", error);
        throw new AuthError(
          "We couldn't send the verification email. Please try again later.",
          502
        );
      }
      return {
        resent: true,
        message:
          "This email is registered but not verified yet. We've sent you a new verification link.",
      };
    }
    throw new AuthError(
      "An account with this email already exists. Try signing in instead.",
      409
    );
  }

  if (await users.findOne({ username })) {
    throw new AuthError("This username is already taken.", 409);
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const result = await users.insertOne({
    username,
    email,
    password: hashedPassword,
    profilePicture: "",
    user_reviews: [],
    verificationToken,
    verificationExpires: tokenExpiry(),
    isVerified: false,
    provider: "credentials",
  });

  try {
    await sendVerificationEmail(email, verificationToken);
  } catch (error) {
    // Don't leave a half-created account the user can neither verify nor re-create
    console.error("Failed to send verification email:", error);
    await users.deleteOne({ _id: result.insertedId });
    throw new AuthError(
      "We couldn't send the verification email. Please try again later.",
      502
    );
  }

  return {
    resent: false,
    message: "A verification message has been sent to your email.",
  };
};

export const addUserOath = async (data: User) => {
  try {
    if (!users) await init();
    if (!users) throw new Error("Users collection is not initialized");

    const { name } = data;
    const email = normalizeEmail(data.email);

    const emailExists = await users.findOne({ email }, CASE_INSENSITIVE);
    if (emailExists) {
      throw new Error("Email already exists");
    }

    // Insert the new user data into the MongoDB collection
    const result = await users.insertOne({
      email,
      name,
      profilePicture: data.profilePicture || "",
      user_reviews: [],
      isVerified: true,
      provider: data.provider || "",
    });

    return {
      message: "User added successfully.",
      result,
    };
  } catch (error) {
    console.error("Failed to add user:", error);
    if (error instanceof Error) {
      throw new Error(`${error.message}`);
    }
    // Re-throw the error in case it's not an instance of Error
    throw error;
  }
};

const tokenExpiry = () => new Date(Date.now() + 24 * 60 * 60 * 1000);

//FUNCTION SENDING VERIFICATION TO EMAIL
const sendVerificationEmail = async (email: string, token: string) => {
  const auth = {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  };
  // Domain mailbox (e.g. info@pixelmovies.gr on Papaki) when SMTP_HOST is set;
  // otherwise falls back to a Gmail account with an App Password.
  const port = Number(process.env.SMTP_PORT) || 465;
  const transporter = process.env.SMTP_HOST
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465, // 465 = SSL, 587 = STARTTLS
        auth,
      })
    : nodemailer.createTransport({ service: "gmail", auth });

  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/verify?token=${token}`;

  const mailOptions = {
    from: `"Pixel Movies" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email address",
    text: `Please verify your email by clicking on the following link: ${verificationUrl}`,
    html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h1 style="color: #4CAF50;">Verify Your Email Address</h1>
      <p>Please verify your email by clicking on the following link:</p>
      <a href="${verificationUrl}" style="color: #ffffff; background-color: #4CAF50; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>If you did not request this email, please ignore it.</p>
    </div>
  `, // HTML content of the email
  };

  await transporter.sendMail(mailOptions);
};

//FUNCTION CHECKS USER EXISTANCE (USERNAME AND EMAIL FOR ERROR CLARIFICATION)
export const checkUserExists = async (username: string, email: string) => {
  if (!users) throw new Error("Users collection is not initialized");
  try {
    const usernameExists = await users.findOne({ username });
    const emailExists = await users.findOne({ email });

    return {
      usernameExists: !!usernameExists,
      emailExists: !!emailExists,
    };
  } catch (error) {
    console.error("Failed to check user existence:", error);
    throw new Error("Failed to check user existence");
  }
};

//FUNCTION CALLED IN THE API (SIGNUP)
export const verifyUserEmail = async (token: string) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  try {
    // Find the user by the verification token and update their status to verified
    const updatedUser = await users.findOneAndUpdate(
      {
        verificationToken: token,
        // Links expire after 24h (older accounts without an expiry still work)
        $or: [
          { verificationExpires: { $exists: false } },
          { verificationExpires: { $gt: new Date() } },
        ],
      },
      {
        $set: { isVerified: true }, // Set the user as verified
        $unset: { verificationToken: "", verificationExpires: "" },
      },
      { returnDocument: "after" } // Return the updated document after the update
    );
    //here will be the logic of redirect
    if (!updatedUser) {
      return {
        status: 400,
        message:
          "This verification link is invalid or has expired. Sign up again with the same email to get a new one.",
      };
    }

    return {
      status: 200,
      message: "Email verified successfully!",
      user: updatedUser,
    };
  } catch (error) {
    console.error("Error verifying email:", error);
    return { status: 500, message: "Error verifying email" };
  }
};

//FUNCTION USED IN SIGNIN
export const logUser = async (email: string, password: string) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  try {
    const user = await users.findOne(
      { email: normalizeEmail(email) },
      CASE_INSENSITIVE
    );
    if (!user) {
      return { status: 400, message: "User does not exist" };
    }

    // Check if the user's email is verified
    if (!user.isVerified) {
      return { status: 400, message: "Email is not verified" };
    }

    // Compare the hashed password with the plain-text password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password || ""
    );
    if (!isPasswordCorrect) {
      return { status: 400, message: "Username or password is incorrect" };
    }

    return {
      status: 200,
      _id: user._id.toString(),
      username: user.username,
      profilePicture: user.profilePicture,
      email: user.email,
      password: user.password,
    };
  } catch (error) {
    console.error("Error verifying user:", error);
    return { status: 500, message: "Error verifying user" };
  }
};

//FUNCTION TO FIND USER BY EMAIL
export const findUserByEmail = async (email: string) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  if (!email) return null;
  return await users.findOne({ email: normalizeEmail(email) }, CASE_INSENSITIVE);
};

//FIND ALL USERS FROM DB (USED FOR RENDERING ALL REVIEWS FOR A GAME)
export const findAllUsers = async () => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  return await users.find({}).toArray();
};

export const findUsersWithGameReviews = async () => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  return await users
    .find({}, { projection: { username: 1, name: 1, user_reviews: 1 } })
    .toArray();
};

export const findUsersWithMovieReviews = async () => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  return await users
    .find({}, { projection: { username: 1, name: 1, user_movie_reviews: 1 } })
    .toArray();
};

export const findUsersWithShowReviews = async () => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  return await users
    .find({}, { projection: { username: 1, name: 1, user_show_reviews: 1 } })
    .toArray();
};

//FUNCTION TO UPDATE USER IMAGE
export const updateUserImage = async (
  email: string,
  profilePicture: string
) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  // Update the user profile with the new profile picture URL
  const result = await users.findOneAndUpdate(
    { email }, // Find user by email
    { $set: { profilePicture } }, // Update the profilePicture field
    { returnDocument: "after" } // Return the updated document
  );

  return result?.profilePicture;
};

// FUNCTION TO FETCH USER DETAILS SPECIFIC FOR PROFILE
export const fetchUserDets = async (email: string) => {
  if (!users) await init(); // Initialize the database if not already done
  if (!users) throw new Error("Users collection is not initialized");

  try {
    const user = await users.findOne({ email });

    if (!user) {
      console.error("User not found");
      throw new Error("User not found");
    }

    return {
      _id: user._id.toString(), // Convert _id to string to avoid BSON issues on the client-side
      profilePicture: user.profilePicture || null, // Return the profile picture or null if not set
      library: user.library || null,
      watchlist: user.watchlist || [],
    };
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    throw new Error("Failed to fetch profile picture");
  }
};

export const findUserById = async (id: string) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");
  try {
    const objectId = new ObjectId(id);
    const result = await users.findOne({ _id: objectId });
    return result;
  } catch (error) {
    console.error("Error fetching user by id:", error);
    throw new Error("Failed to fetch user by id");
  }
};

//FUNCTION TO UPDATE USER FIELDS
export const updateUserById = async (
  id: string,
  updatedFields: { username?: string; password?: string }
) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  try {
    const objectId = new ObjectId(id);
    const result = await users.findOneAndUpdate(
      { _id: objectId },
      { $set: updatedFields }, // Use $set to only update the provided fields
      { returnDocument: "after" } // Return the updated document
    );
    return result;
  } catch (error) {
    console.error("Error updating user by id:", error);
    throw new Error("Failed to update user by id");
  }
};

//FUNTION ADDING A MOVIE TO WATCHLIST
export const addToWatchlist = async (userId: string, item: {id: number; media_type:string}) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  try {
    const objectId = new ObjectId(userId);
    const result = await users.findOneAndUpdate(
      { _id: objectId },
      { $addToSet: { watchlist: item } }, // Use $addToSet to add the movieId to the watchlist array
      { returnDocument: "after" } // Return the updated document
    );
    return result;
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    throw new Error("Failed to update user by id");
  }
};

//ADD GAME TO LIBRARY
export const addToList = async (
  userId: string,
  gameId: number,
  gameName: string,
  gamePic: string,
  date: Date
) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  const libraryId = Math.floor(Math.random() * 900000) + 100000;

  const newAddition: Library = {
    libraryId: libraryId,
    gameId: gameId,
    gameName: gameName,
    gamePic: gamePic,
    date: new Date(date).toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // Change to true if you want AM/PM
    }),
  };
  try {
    const objectId = new ObjectId(userId);
    const result = await users.findOneAndUpdate(
      { _id: objectId },
      { $addToSet: { library: newAddition } }, // Use $addToSet to add the elements
      { returnDocument: "after" } // Return the updated document
    );
    return result;
  } catch (error) {
    console.error("Error adding to List:", error);
    throw new Error("Failed to update user by id");
  }
};

//ADD MOVIE REVIEW
export const addMovieReview = async (
  userId: string,
  movieId: number,
  movieName: string,
  text: string,
  rating: number,
  date: Date
) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  const reviewId = Math.floor(Math.random() * 900000) + 100000;
  const newReview: MovieReview = {
    reviewId: reviewId,
    movieId: movieId,
    movieName: movieName,
    text: text,
    rating: rating,
    date: new Date(date).toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // Change to true if you want AM/PM
    }),
  };

  try {
    const objectId = new ObjectId(userId);
    const result = await users.findOneAndUpdate(
      { _id: objectId },
      { $push: { user_movie_reviews: newReview } },
      { returnDocument: "after" }
    );
    return result;
  } catch (error) {
    console.error("Error adding to reviews:", error);
    throw new Error("Failed to update user by id");
  }
};

//ADD SHOW REVIEW
export const addShowReview = async (
  userId: string,
  showId: number,
  showName: string,
  text: string,
  rating: number,
  date: Date
) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  const reviewId = Math.floor(Math.random() * 900000) + 100000;
  const newReview: ShowReview = {
    reviewId: reviewId,
    showId: showId,
    showName: showName,
    text: text,
    rating: rating,
    date: new Date(date).toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // Change to true if you want AM/PM
    }),
  };

  try {
    const objectId = new ObjectId(userId);
    const result = await users.findOneAndUpdate(
      { _id: objectId },
      { $push: { user_show_reviews: newReview } },
      { returnDocument: "after" }
    );
    return result;
  } catch (error) {
    console.error("Error adding to reviews:", error);
    throw new Error("Failed to update user by id");
  }
};

//ADDING USER REVIEW
export const addUserReview = async (
  userId: string,
  gameId: number,
  gameName: string,
  reaction: string,
  text: string,
  date: Date
) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  const reviewId = Math.floor(Math.random() * 900000) + 100000;
  // Create a new review object
  const newReview: Review = {
    reviewId: reviewId,
    gameId: gameId,
    gameName: gameName,
    reaction: reaction,
    text: text,
    date: new Date(date).toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // Change to true if you want AM/PM
    }),
  };
  try {
    const objectId = new ObjectId(userId);
    const result = await users.findOneAndUpdate(
      { _id: objectId },
      { $push: { user_reviews: newReview } },
      { returnDocument: "after" }
    );
    return result;
  } catch (error) {
    console.error("Error adding to reviews:", error);
    throw new Error("Failed to update user by id");
  }
};

// FUNCTION TO DELETE USER FROM PROFILE
export const deleteUserById = async (userId: string) => {
  try {
    if (!users) await init();
    if (!users) throw new Error("Users collection is not initialized");

    // Convert userId string to ObjectId
    const objectId = new ObjectId(userId);

    // Delete the user from the collection
    const result = await users.deleteOne({ _id: objectId });

    if (result.deletedCount === 1) {
      return { message: "User deleted successfully" };
    } else {
      return { message: "User not found" };
    }
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw new Error("Failed to delete user");
  }
};

//FUNCTION TO REMOVE GAME FROM PROFILE
export const removeGame = async (userId: string, libraryId: number) => {
  try {
    if (!users) await init();
    if (!users) throw new Error("Users collection is not initialized");

    // Convert userId string to ObjectId
    const objectId = new ObjectId(userId);

    // Update the user's library by removing the game with the specified gameId
    const result = await users.updateOne(
      { _id: objectId }, // Find the user by _id
      { $pull: { library: { libraryId: libraryId } } } // Remove the game from the library array
    );

    if (result.modifiedCount === 1) {
      return { message: "Game removed from library successfully" };
    } else {
      return { message: "Game not found or no changes made" };
    }
  } catch (error) {
    console.error("Failed to remove game:", error);
    throw new Error("Failed to remove game");
  }
};

//FUNCTION TO REMOVE REVIEW FROM PROFILE
export const removeReview = async (userId: string, reviewId: number) => {
  try {
    if (!users) await init();
    if (!users) throw new Error("Users collection is not initialized");

    // Convert userId string to ObjectId
    const objectId = new ObjectId(userId);

    // Update the user's library by removing the game with the specified gameId
    const result = await users.updateOne(
      { _id: objectId }, // Find the user by _id
      { $pull: { user_reviews: { reviewId: reviewId } } } // Remove the game from the library array
    );

    if (result.modifiedCount === 1) {
      return { message: "Review has been succesfully removed." };
    } else {
      return { message: "Review not found or no changes made" };
    }
  } catch (error) {
    console.error("Failed to remove review:", error);
    throw new Error("Failed to remove review");
  }
};
