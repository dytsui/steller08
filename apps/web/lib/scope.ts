import 'server-only';

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
