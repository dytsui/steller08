import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, parseSessionCookie, sha256 } from "@/lib/auth";
import { deleteAuthSession } from "@/lib/auth-store";

export async function POST() {
  const cookieStore = await cookies();
  const payload = parseSessionCookie(cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null);
  if (payload) {
    await deleteAuthSession(await sha256(payload.token));
  }
  cookieStore.delete(AUTH_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
