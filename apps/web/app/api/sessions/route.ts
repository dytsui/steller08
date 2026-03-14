import { NextResponse } from "next/server";
import { getCurrentSessionPayload } from '@/lib/auth';
import { createSession, getSession, getStudentForScope } from "@/lib/d1";
import { makeVideoKey, uploadMedia } from "@/lib/r2";
import { makeId } from "@/lib/utils";
import type { AnalysisSource, SessionRecord } from "@/lib/types";

function scopeFromPayload(payload: Awaited<ReturnType<typeof getCurrentSessionPayload>>) {
  if (!payload) return null;
  if (payload.role === 'admin') return { role: 'admin' as const, userId: payload.userId };
  if (payload.role === 'pro') return { role: 'pro' as const, userId: payload.userId };
  return { role: 'user' as const, userId: payload.userId };
}

export async function POST(request: Request) {
  const payload = await getCurrentSessionPayload();
  const scope = scopeFromPayload(payload);
  if (!scope) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const studentId = String(formData.get("studentId") ?? "");
  const sourceType = String(formData.get("sourceType") ?? "upload") as AnalysisSource;

  if (!file || !studentId) {
    return NextResponse.json({ error: "missing_file_or_student" }, { status: 400 });
  }
  const student = await getStudentForScope(studentId, scope);
  if (!student) return NextResponse.json({ error: 'student_forbidden' }, { status: 403 });

  const sessionId = makeId("ses");
  const videoKey = makeVideoKey(sessionId, file.name || "swing.mp4");
  await uploadMedia("VIDEOS", videoKey, await file.arrayBuffer(), file.type || "video/mp4");
  const now = new Date().toISOString();
  const session: SessionRecord = {
    id: sessionId,
    studentId,
    sourceType,
    status: "created",
    videoKey,
    shareKey: null,
    createdAt: now,
    updatedAt: now
  };
  await createSession(session);
  return NextResponse.json({ session });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  const session = await getSession(id);
  return NextResponse.json({ session });
}
