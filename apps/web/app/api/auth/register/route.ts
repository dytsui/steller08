import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildSession, hashPassword, AUTH_COOKIE_NAME } from "@/lib/auth";
import { createAuthSession, createUser, getUserByEmail } from "@/lib/auth-store";
import type { UserAccount, UserRole } from "@/lib/types";
import { makeId } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.json() as { email?: string; password?: string; displayName?: string; role?: UserRole };
  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();
  const role = body.role === "pro" ? "pro" : "user";
  if (!email || !password || password.length < 6) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 400 });
  }
  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "email_exists" }, { status: 409 });
  }
  const now = new Date().toISOString();
  const user: UserAccount & { passwordHash: string } = {
    id: makeId("usr"),
    email,
    role,
    displayName: body.displayName?.trim() || (role === "pro" ? "Pro 用户" : "新用户"),
    avatarUrl: null,
    status: "active",
    createdAt: now,
    updatedAt: now,
    passwordHash: await hashPassword(password)
  };
  await createUser(user);
  const built = await buildSession(user);
  await createAuthSession(built.payload, built.tokenHash);
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, built.cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });
  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role
    }
  });
}
