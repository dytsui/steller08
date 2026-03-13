import { cookies } from "next/headers";
import type { UserAccount, UserRole } from "@/lib/types";
import { getEnv } from "@/lib/cloudflare";

export const AUTH_COOKIE_NAME = "steller08_session";

export type AuthSessionPayload = {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  token: string;
};

export function serializeSessionCookie(payload: AuthSessionPayload) {
  return encodeURIComponent(JSON.stringify(payload));
}

export function parseSessionCookie(raw?: string | null): AuthSessionPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as AuthSessionPayload;
    if (!parsed?.userId || !parsed?.role || !parsed?.token) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function sha256(input: string) {
  const encoded = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest)).map((value) => value.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(password: string) {
  const secret = getEnv().AUTH_SECRET ?? "steller08-auth";
  return sha256(`${password}:${secret}`);
}

export async function buildSession(user: Pick<UserAccount, "id" | "email" | "displayName" | "role">) {
  const token = crypto.randomUUID();
  const tokenHash = await sha256(token);
  const payload: AuthSessionPayload = {
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    token
  };
  return { payload, tokenHash, cookieValue: serializeSessionCookie(payload) };
}

export async function getCurrentSessionPayload() {
  const cookieStore = await cookies();
  return parseSessionCookie(cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null);
}

export async function requirePortalRole(role: UserRole) {
  const payload = await getCurrentSessionPayload();
  if (!payload || payload.role !== role) return null;
  return payload;
}
