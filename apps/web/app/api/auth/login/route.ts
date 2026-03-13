import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, buildSession, hashPassword } from "@/lib/auth";
import { createAuthSession, getUserByEmail } from "@/lib/auth-store";

export async function POST(request: Request) {
  const body = await request.json() as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();
  if (!email || !password) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 400 });
  }
  const user = await getUserByEmail(email);
  if (!user || user.passwordHash !== await hashPassword(password)) {
    return NextResponse.json({ error: "email_or_password_invalid" }, { status: 401 });
  }
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
