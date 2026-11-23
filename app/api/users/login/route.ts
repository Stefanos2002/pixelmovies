// /app/api/users/login.ts
export const dynamic = 'force-dynamic';
import { findUserByEmail } from "@/app/User Collection/connection";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/authDbConnection/rateLimit";

export async function POST(req: NextRequest) {
  try {
    if (!(await rateLimit(`login-check:${clientIp(req.headers)}`, 30, 15 * 60))) {
      return NextResponse.json(
        { message: "Too many attempts. Please wait a few minutes." },
        { status: 429 }
      );
    }
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Only what the sign-in form needs — not the whole profile
    return NextResponse.json({
      data: { provider: user.provider || "credentials", isVerified: !!user.isVerified },
    });
  } catch (error) {
    console.error("Error verifying user:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
