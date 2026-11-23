import clientPromise from "@/authDbConnection/mongo/page";
import { requireOwner } from "@/authDbConnection/requireUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { email: string } }) {
  const email = decodeURIComponent(params.email);

  // Profiles (id, library, reviews) are private: only return your own
  const auth = await requireOwner({ email });
  if (auth instanceof NextResponse) return auth;

  try {
    const client = await clientPromise;
    // Same DB as the rest of the app (the one named in MONGODB_URI)
    const db = client.db();
    const userCollection = db.collection("users");

    const existingUser = await userCollection.findOne(
      { _id: auth._id },
      { projection: { password: 0, verificationToken: 0 } }
    );
    if (!existingUser) {
      return NextResponse.json("User not found", { status: 404 });
    }
    return NextResponse.json(existingUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
