import { findUserById, updateUserById } from "@/app/User Collection/connection";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authDbConnection/authOptions";
import { requireOwner } from "@/authDbConnection/requireUser";

export async function GET(
  req: NextRequest,
  { params }: { params: { userid: string } }
) {
  const userid = params.userid;
  const auth = await requireOwner({ userId: userid });
  if (auth instanceof NextResponse) return auth;
  try {
    const result = await findUserById(userid);
    // Never send the password hash or verification token to the browser
    const { password, verificationToken, ...safe } = (result ?? {}) as any;
    return NextResponse.json({ success: true, data: result ? safe : null });
  } catch (err) {
    return NextResponse.json({ success: false, message: "No data found" });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { userid: string } }
) {
  const userid = params.userid;
  const { username, password } = await req.json();
  try {
    // Fetch the current user data
    const currentUser = await findUserById(userid);

    // Only the signed-in owner of this account may change it
    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email?.toLowerCase();
    if (
      !sessionEmail ||
      !currentUser ||
      currentUser.email?.toLowerCase() !== sessionEmail
    ) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }
    // OAuth accounts have no password to change
    if (password && (currentUser.provider || "credentials") !== "credentials") {
      return NextResponse.json(
        { success: false, message: "This account signs in with a provider and has no password." },
        { status: 400 }
      );
    }

    // Prepare the updated fields
    const updatedFields: any = {
      username: username || currentUser?.username, // Default to current username if not provided
    };

    // Only update password if it's provided and non-empty
    if (password && password.trim()) {
      updatedFields.password = await bcrypt.hash(password, 10);
    }

    // Update user in the database
    const result = await updateUserById(userid, updatedFields);

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json({ success: false, message: "No data found" });
  }
}
