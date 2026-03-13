import { NextResponse } from "next/server";
import { getAnalysis, getSession, getStudent } from "@/lib/d1";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession(id);
  if (!session) return NextResponse.json({ error: "session_not_found" }, { status: 404 });
  const student = await getStudent(session.studentId);
  const analysis = await getAnalysis(id);
  return NextResponse.json({ session, student, analysis });
}
