import { getCurrentSessionPayload, type AuthSessionPayload } from '@/lib/auth';

export type RequestScope = { role: 'user' | 'pro' | 'admin'; userId: string };

export function scopeFromPayload(payload: AuthSessionPayload | null): RequestScope | null {
  if (!payload) return null;
  if (payload.role === 'admin') return { role: 'admin', userId: payload.userId };
  if (payload.role === 'pro') return { role: 'pro', userId: payload.userId };
  return { role: 'user', userId: payload.userId };
}

export async function getRequestScope(): Promise<RequestScope | null> {
  return scopeFromPayload(await getCurrentSessionPayload());
}

export function portalFromRole(role: string | null | undefined) {
  return role === 'pro' || role === 'admin' ? 'pro' : 'app';
}

export function analysisPathForPortal(portal: 'app' | 'pro' | 'public', sessionId: string) {
  if (portal === 'pro') return `/pro/analysis/${sessionId}`;
  if (portal === 'app') return `/app/analysis/${sessionId}`;
  return `/analysis/${sessionId}`;
}

export function studentPathForPortal(portal: 'app' | 'pro', studentId: string) {
  return portal === 'pro' ? `/pro/students/${studentId}` : '/app/profile';
}
