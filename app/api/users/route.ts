export const dynamic = "force-dynamic";
import { addUser, AuthError } from "@/app/User Collection/connection";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/authDbConnection/rateLimit";

// Same rules as the signup form — enforced here too, since the form can be bypassed
const USERNAME_RE = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d\W]{10,}$/;
const PASSWORD_RE = /^(?=.*[A-Z])[A-Za-z\d\W]{10,}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    // Every signup sends an email from our Gmail account — cap it per IP
    if (!(await rateLimit(`signup:${clientIp(req.headers)}`, 5, 60 * 60))) {
      return NextResponse.json(
        { message: "Too many sign-up attempts. Please try again in an hour." },
        { status: 429 }
      );
    }

    const { username, email, password } = await req.json();

    const errors: string[] = [];
    if (typeof username !== "string" || !USERNAME_RE.test(username.trim())) {
      errors.push(
        "Username must be at least 10 characters, include one capital letter and one number."
      );
    }
    if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      errors.push("Please enter a valid email address.");
    }
    if (typeof password !== "string" || !PASSWORD_RE.test(password)) {
      errors.push(
        "Password must be at least 10 characters and include one capital letter."
      );
    }
    if (errors.length) {
      return NextResponse.json({ message: errors[0], errors }, { status: 400 });
    }

    const result = await addUser({ username, email, password });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }
    console.error("Failed to add user:", error);
    return NextResponse.json(
      { message: "Something went wrong while creating your account. Please try again." },
      { status: 500 }
    );
  }
}
