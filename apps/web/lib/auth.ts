import 'server-only';

import { cookies } from 'next/headers';
import type { UserAccount, UserRole } from '@/lib/types';
import { getEnv } from '@/lib/cloudflare';

export const AUTH_COOKIE_NAME = 'steller08_session';

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
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPassword(password: string) {
  const secret = getEnv().AUTH_SECRET ?? 'steller08-auth';
  return sha256(`${password}:${secret}`);
}

export async function buildSession(user: Pick<UserAccount, 'id' | 'email' | 'displayName' | 'role'>) {
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

async function validateSessionPayload(payload: AuthSessionPayload | null) {
  if (!payload) return null;
  const tokenHash = await sha256(payload.token);
  const row = await getEnv().DB.prepare(`
    SELECT s.user_id as userId, s.role, s.expires_at as expiresAt,
           u.email, u.display_name as displayName, u.status
    FROM auth_sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.user_id = ?1 AND s.token_hash = ?2
    LIMIT 1
  `)
    .bind(payload.userId, tokenHash)
    .first();

  if (!row) return null;
  if (row.status !== 'active') return null;
  const expiresAt = new Date(String(row.expiresAt ?? ''));
  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) return null;

  return {
    userId: payload.userId,
    email: String(row.email ?? payload.email),
    displayName: String(row.displayName ?? payload.displayName),
    role: (row.role ?? payload.role) as UserRole,
    token: payload.token
  } as AuthSessionPayload;
}

export async function getCurrentSessionPayload() {
  const cookieStore = await cookies();
  const parsed = parseSessionCookie(cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null);
  return validateSessionPayload(parsed);
}

export async function requirePortalRole(role: UserRole) {
  const payload = await getCurrentSessionPayload();
  if (!payload || payload.role !== role) return null;
  return payload;
}
