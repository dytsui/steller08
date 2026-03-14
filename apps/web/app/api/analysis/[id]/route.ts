import { NextResponse } from "next/server";
import { getCurrentSessionPayload } from '@/lib/auth';
import { getAnalysis, getSessionForScope, getStudentForScope } from "@/lib/d1";

function scopeFromPayload(payload: Awaited<ReturnType<typeof getCurrentSessionPayload>>) {
  if (!payload) return null;
  if (payload.role === 'admin') return { role: 'admin' as const, userId: payload.userId };
  if (payload.role === 'pro') return { role: 'pro' as const, userId: payload.userId };
  return { role: 'user' as const, userId: payload.userId };
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getCurrentSessionPayload();
  const scope = scopeFromPayload(payload);
  if (!scope) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  const session = await getSessionForScope(id, scope);
  if (!session) return NextResponse.json({ error: 'session_not_found' }, { status: 404 });
  const analysis = await getAnalysis(id);
  const student = await getStudentForScope(session.studentId, scope);
  return NextResponse.json({ analysis, session, student });
}
