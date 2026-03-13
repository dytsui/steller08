import { NextResponse } from "next/server";
import { getAnalysis, getSession, getStudent } from "@/lib/d1";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const analysis = await getAnalysis(id);
  const session = await getSession(id);
  const student = session ? await getStudent(session.studentId) : null;
  return NextResponse.json({ analysis, session, student });
}
