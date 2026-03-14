import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { RequestScope } from "@/types/domain";

export async function getRequestScope(): Promise<RequestScope | null> {
  const session = await getAuthSession();
  if (!session) return null;
  return {
    role: session.role,
    userId: session.userId,
    canReadAll: session.role === "admin",
    coachUserId: session.role === "pro" ? session.userId : undefined
  };
}

export function scopeFromPayload(role: RequestScope["role"], userId: string): RequestScope {
  return { role, userId, canReadAll: role === "admin", coachUserId: role === "pro" ? userId : undefined };
}

export function requireScope(scope: RequestScope | null): RequestScope {
  if (!scope) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return scope;
}
