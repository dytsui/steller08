import { cookies } from "next/headers";
import { appEnv } from "@/lib/env";
import { exec, one } from "@/lib/db";
import { nowIso, uid } from "@/lib/utils";
import type { AppSession, Role } from "@/types/domain";

const COOKIE_NAME = "steller09_session";

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input + appEnv.server.authSecret);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(raw: string): Promise<string> {
  return sha256(`pwd:${raw}`);
}

export async function verifyPassword(raw: string, storedHash: string): Promise<boolean> {
  return storedHash === (await hashPassword(raw));
}

export async function createAuthSession(userId: string, role: Role): Promise<string> {
  const token = uid("token");
  const tokenHash = await sha256(token);
  const sessionId = uid("sess");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
  await exec(
    "INSERT INTO auth_sessions (id, user_id, token_hash, role, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [sessionId, userId, tokenHash, role, expiresAt, nowIso()]
  );
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
  return token;
}

export async function clearAuthSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = await sha256(token);
    await exec("DELETE FROM auth_sessions WHERE token_hash = ?", [tokenHash]);
  }
  jar.delete(COOKIE_NAME);
}

export async function getAuthSession(): Promise<AppSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const tokenHash = await sha256(token);
  const row = await one<{ user_id: string; role: Role; email: string; display_name: string; expires_at: string }>(
    `SELECT s.user_id, s.role, u.email, u.display_name, s.expires_at
     FROM auth_sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ?`,
    [tokenHash]
  );
  if (!row || row.expires_at < nowIso()) return null;
  return { userId: row.user_id, role: row.role, email: row.email, displayName: row.display_name };
}
