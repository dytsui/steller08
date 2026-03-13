import { NextResponse } from "next/server";
import { getStudent, upsertStudent } from "@/lib/d1";
import type { Student } from "@/lib/types";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await getStudent(id);
  if (!student) return NextResponse.json({ error: "student_not_found" }, { status: 404 });
  return NextResponse.json({ student });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await getStudent(id);
  if (!existing) return NextResponse.json({ error: "student_not_found" }, { status: 404 });
  const body = await request.json() as Partial<Student>;
  const next: Student = {
    ...existing,
    ...body,
    id,
    updatedAt: new Date().toISOString()
  };
  await upsertStudent(next);
  return NextResponse.json({ student: next });
}
