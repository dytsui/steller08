import { NextResponse } from "next/server";
import { getCurrentSessionPayload } from "@/lib/auth";
import { getStudentForScope, getStudentWithOwnership, listStudents, upsertStudent } from "@/lib/d1";
import { makeId } from "@/lib/utils";
import type { Student } from "@/lib/types";

function scopeFromPayload(payload: Awaited<ReturnType<typeof getCurrentSessionPayload>>) {
  if (!payload) return null;
  if (payload.role === 'admin') return { role: 'admin' as const, userId: payload.userId };
  if (payload.role === 'pro') return { role: 'pro' as const, userId: payload.userId };
  return { role: 'user' as const, userId: payload.userId };
}

export async function GET(request: Request) {
  const payload = await getCurrentSessionPayload();
  const scope = scopeFromPayload(payload);
  if (!scope) return NextResponse.json({ students: [] });
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    const student = await getStudentForScope(id, scope);
    return NextResponse.json({ student });
  }
  const students = await listStudents(scope);
  return NextResponse.json({ students });
}

export async function POST(request: Request) {
  const payload = await getCurrentSessionPayload();
  const scope = scopeFromPayload(payload);
  if (!scope) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await request.json() as Partial<Student>;
  const now = new Date().toISOString();
  const student: Student & { userId?: string | null; coachUserId?: string | null } = {
    id: body.id ?? makeId("stu"),
    userId: scope.role === 'user' ? scope.userId : body.id ? undefined : null,
    coachUserId: scope.role === 'pro' ? scope.userId : null,
    name: body.name ?? (scope.role === 'user' ? '我的档案' : '未命名学员'),
    dominantHand: body.dominantHand === "left" ? "left" : "right",
    level: body.level ?? "Beginner",
    handicap: Number(body.handicap ?? 28),
    notes: body.notes ?? "",
    createdAt: now,
    updatedAt: now
  };
  await upsertStudent(student);
  return NextResponse.json({ student });
}

export async function PATCH(request: Request) {
  const payload = await getCurrentSessionPayload();
  const scope = scopeFromPayload(payload);
  if (!scope) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await request.json() as Student;
  const existing = await getStudentWithOwnership(body.id);
  if (!existing) {
    return NextResponse.json({ error: "student_not_found" }, { status: 404 });
  }
  if (scope.role === 'user' && existing.userId !== scope.userId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (scope.role === 'pro' && existing.coachUserId !== scope.userId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const updated: Student & { userId?: string | null; coachUserId?: string | null } = {
    ...existing,
    ...body,
    id: body.id,
    userId: existing.userId ?? null,
    coachUserId: existing.coachUserId ?? null,
    updatedAt: new Date().toISOString()
  };
  await upsertStudent(updated);
  return NextResponse.json({ student: updated });
}
