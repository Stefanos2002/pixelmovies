import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  addUserOath,
  findUserByEmail,
  logUser,
} from "@/app/User Collection/connection";
import { ObjectId } from "mongodb";
import { rateLimit } from "./rateLimit";

interface User {
  _id: ObjectId;
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  verificationToken?: string;
  isVerified?: boolean;
  isSignUp?: boolean;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("No such credentials");
          return null; // Return null if no credentials
        }

        // Slow down password guessing: 10 attempts per email per 15 minutes
        const emailKey = credentials.email.trim().toLowerCase();
        if (!(await rateLimit(`login:${emailKey}`, 10, 15 * 60))) {
          console.log("Too many login attempts for", emailKey);
          return null;
        }

        const user = await logUser(credentials.email, credentials.password);

        if (user.status === 200 && user._id) {
          console.log("passwords matched");
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.username,
          }; // Return user object with id as string
        }
        console.log("something went wrong with authorize");
        return null; // Return null if invalid
      },
    }),
  ],
  pages: {
    signIn: "/authentication/signin",
  },
  session: {
    strategy: "jwt",
    //JWTs(JSON web tokens) are used to store and verify user session data without saving anything on the server.
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider && account.provider !== "credentials") {
          // For OAuth users, fetch the MongoDB record to get the real _id
          const dbUser = await findUserByEmail(user.email || "");
          token.user = {
            id: dbUser?._id?.toString() ?? "",
            email: user.email,
            name: user.name,
            image:
              (user as { image?: string }).image ??
              dbUser?.profilePicture ??
              "",
          };
        } else {
          token.user = { ...user };
        }
      }
      return token;
    },

    async signIn({ user, account }) {
      if (user && account) {
        const email = user.email;
        const name = user.name;

        // e.g. GitHub accounts with a private email: without an email we
        // can't create or match a user record, so refuse with a clear reason
        if (!email) {
          return "/authentication/signin?error=NoEmail";
        }

        // Find user by email to check existence (case-insensitive)
        const existingUser = await findUserByEmail(email);

        if (existingUser) {
          // Check if the existing user was created via credentials or another provider
          let provider = existingUser.provider || "credentials"; // Default to "credentials" if undefined

          if (["github", "google"].includes(account.provider)) {
            if (account.provider !== provider) {
              return `/authentication/signin?error=EmailInUse&provider=${provider}`;
            }
            return true;
          }
          // If the user is signing in with credentials and the account was also created with credentials
          if (
            account.provider === "credentials" &&
            provider === "credentials"
          ) {
            // Allow sign-in with credentials
            return true;
          }
        }

        // Create a new user if it does not exist
        try {
          await addUserOath({
            email: email ?? "",
            name: name ?? "",
            profilePicture: user.image || "",
            isVerified: true,
            provider: account.provider,
          });
        } catch (error) {
          console.error("Failed to create OAuth user:", error);
          return false;
        }

        return true; // Allow sign-in
      }

      return false; // Deny sign-in if no user or account is provided
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as User;
      }
      return session;
    },
  },
};
