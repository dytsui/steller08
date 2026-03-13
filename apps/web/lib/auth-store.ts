import { getEnv } from "@/lib/cloudflare";
import type { AuthSessionPayload } from "@/lib/auth";
import type { CoachInvite, CoachStudentLink, UserAccount, UserRole } from "@/lib/types";

function db() {
  return getEnv().DB;
}

export async function createUser(user: UserAccount & { passwordHash: string }) {
  await db().prepare(`
    INSERT INTO users (id, email, password_hash, role, display_name, avatar_url, status, created_at, updated_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
  `).bind(
    user.id,
    user.email,
    user.passwordHash,
    user.role,
    user.displayName,
    user.avatarUrl ?? null,
    user.status,
    user.createdAt,
    user.updatedAt
  ).run();
}

export async function getUserByEmail(email: string) {
  const row = await db().prepare(`
    SELECT id, email, password_hash as passwordHash, role, display_name as displayName,
           avatar_url as avatarUrl, status, created_at as createdAt, updated_at as updatedAt
    FROM users WHERE lower(email) = lower(?1) LIMIT 1
  `).bind(email).first();
  return (row ?? null) as (UserAccount & { passwordHash: string }) | null;
}

export async function getUserById(id: string) {
  const row = await db().prepare(`
    SELECT id, email, role, display_name as displayName, avatar_url as avatarUrl,
           status, created_at as createdAt, updated_at as updatedAt
    FROM users WHERE id = ?1 LIMIT 1
  `).bind(id).first();
  return (row ?? null) as UserAccount | null;
}

export async function createAuthSession(session: AuthSessionPayload, tokenHash: string) {
  await db().prepare(`
    INSERT INTO auth_sessions (id, user_id, token_hash, role, expires_at, created_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6)
  `).bind(
    crypto.randomUUID(),
    session.userId,
    tokenHash,
    session.role,
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    new Date().toISOString()
  ).run();
}

export async function deleteAuthSession(tokenHash: string) {
  await db().prepare(`DELETE FROM auth_sessions WHERE token_hash = ?1`).bind(tokenHash).run();
}

export async function createCoachInvite(invite: CoachInvite) {
  await db().prepare(`
    INSERT INTO coach_invites (id, coach_user_id, invite_code, email, status, expires_at, created_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
  `).bind(
    invite.id,
    invite.coachUserId,
    invite.inviteCode,
    invite.email ?? null,
    invite.status,
    invite.expiresAt,
    invite.createdAt
  ).run();
}

export async function listCoachInvites(coachUserId: string) {
  const result = await db().prepare(`
    SELECT id, coach_user_id as coachUserId, invite_code as inviteCode,
           email, status, expires_at as expiresAt, created_at as createdAt
    FROM coach_invites WHERE coach_user_id = ?1 ORDER BY created_at DESC
  `).bind(coachUserId).all();
  return (result.results ?? []) as CoachInvite[];
}

export async function linkCoachAndStudent(link: CoachStudentLink) {
  await db().prepare(`
    INSERT INTO coach_student_links (id, coach_user_id, student_user_id, student_profile_id, relationship_status, created_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6)
  `).bind(
    link.id,
    link.coachUserId,
    link.studentUserId ?? null,
    link.studentProfileId ?? null,
    link.relationshipStatus,
    link.createdAt
  ).run();
}

export async function listCoachLinks(coachUserId: string) {
  const result = await db().prepare(`
    SELECT id, coach_user_id as coachUserId, student_user_id as studentUserId,
           student_profile_id as studentProfileId, relationship_status as relationshipStatus,
           created_at as createdAt
    FROM coach_student_links WHERE coach_user_id = ?1 ORDER BY created_at DESC
  `).bind(coachUserId).all();
  return (result.results ?? []) as CoachStudentLink[];
}

export async function countRole(role: UserRole) {
  const row = await db().prepare(`SELECT COUNT(*) as count FROM users WHERE role = ?1`).bind(role).first();
  return Number(row?.count ?? 0);
}
