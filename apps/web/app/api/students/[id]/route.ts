import { NextResponse } from "next/server";
import { getCurrentSessionPayload } from '@/lib/auth';
import { getStudentForScope, getStudentWithOwnership, upsertStudent } from "@/lib/d1";
import type { Student } from "@/lib/types";

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
  const student = await getStudentForScope(id, scope);
  if (!student) return NextResponse.json({ error: "student_not_found" }, { status: 404 });
  return NextResponse.json({ student });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getCurrentSessionPayload();
  const scope = scopeFromPayload(payload);
  if (!scope) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  const existing = await getStudentWithOwnership(id);
  if (!existing) return NextResponse.json({ error: "student_not_found" }, { status: 404 });
  if (scope.role === 'user' && existing.userId !== scope.userId) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (scope.role === 'pro' && existing.coachUserId !== scope.userId) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = await request.json() as Partial<Student>;
  const next = {
    ...existing,
    ...body,
    id,
    updatedAt: new Date().toISOString()
  };
  await upsertStudent(next);
  return NextResponse.json({ student: next });
}
