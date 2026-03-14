import { cookies } from "next/headers";
import { appEnv } from "@/lib/env";
import { exec, one } from "@/lib/db";
import { nowIso, uid } from "@/lib/utils";
import type { AppSession, Role } from "@/types/domain";

const COOKIE = "steller09_session";

async function digest(text: string): Promise<string> {
  const data = new TextEncoder().encode(`${appEnv.server.authSecret}:${text}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const hashPassword = (plain: string) => digest(`pwd:${plain}`);
export const verifyPassword = async (plain: string, hash: string) => (await hashPassword(plain)) === hash;

export async function createSession(userId: string, role: Role): Promise<void> {
  const token = uid("tok");
  const tokenHash = await digest(token);
  await exec("INSERT INTO auth_sessions (id, user_id, token_hash, role, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)", [
    uid("sess"),
    userId,
    tokenHash,
    role,
    new Date(Date.now() + 7 * 86400000).toISOString(),
    nowIso()
  ]);
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await exec("DELETE FROM auth_sessions WHERE token_hash = ?", [await digest(token)]);
  jar.delete(COOKIE);
}

export async function getAuthSession(): Promise<AppSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const row = await one<{ user_id: string; role: Role; email: string; display_name: string; expires_at: string }>(
    `SELECT s.user_id, s.role, u.email, u.display_name, s.expires_at
     FROM auth_sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ?`,
    [await digest(token)]
  );
  if (!row || row.expires_at < nowIso()) return null;
  return { userId: row.user_id, role: row.role, email: row.email, displayName: row.display_name };
}
