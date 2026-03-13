import { NextResponse } from "next/server";
import { getStudent, listStudents, upsertStudent } from "@/lib/d1";
import { makeId } from "@/lib/utils";
import type { Student } from "@/lib/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    const student = await getStudent(id);
    return NextResponse.json({ student });
  }
  const students = await listStudents();
  return NextResponse.json({ students });
}

export async function POST(request: Request) {
  const body = await request.json() as Partial<Student>;
  const now = new Date().toISOString();
  const student: Student = {
    id: body.id ?? makeId("stu"),
    name: body.name ?? "未命名学员",
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
  const body = await request.json() as Student;
  const existing = await getStudent(body.id);
  if (!existing) {
    return NextResponse.json({ error: "student_not_found" }, { status: 404 });
  }
  const updated: Student = { ...existing, ...body, updatedAt: new Date().toISOString() };
  await upsertStudent(updated);
  return NextResponse.json({ student: updated });
}
