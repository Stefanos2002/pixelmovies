import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./authOptions";
import { findUserByEmail } from "@/app/User Collection/connection";

type DbUser = NonNullable<Awaited<ReturnType<typeof findUserByEmail>>>;

/**
 * Resolves the signed-in user's DB record, or a 401 response.
 * Usage: const auth = await requireUser(); if (auth instanceof NextResponse) return auth;
 */
export async function requireUser(): Promise<DbUser | NextResponse> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ message: "Please sign in first." }, { status: 401 });
  }
  const user = await findUserByEmail(email);
  if (!user) {
    return NextResponse.json({ message: "Please sign in first." }, { status: 401 });
  }
  return user;
}

/**
 * Like requireUser, but also checks that the user id / email the client sent
 * belongs to the signed-in user (prevents acting on someone else's account).
 */
export async function requireOwner(
  claimed: { userId?: string | null; email?: string | null },
): Promise<DbUser | NextResponse> {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const idMismatch =
    claimed.userId != null && user._id.toString() !== String(claimed.userId);
  const emailMismatch =
    claimed.email != null &&
    user.email?.toLowerCase() !== String(claimed.email).trim().toLowerCase();

  if (idMismatch || emailMismatch) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }
  return user;
}
