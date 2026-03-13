import { NextResponse } from "next/server";
import { createSession, getSession } from "@/lib/d1";
import { makeVideoKey, uploadMedia } from "@/lib/r2";
import { makeId } from "@/lib/utils";
import type { AnalysisSource, SessionRecord } from "@/lib/types";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const studentId = String(formData.get("studentId") ?? "");
  const sourceType = String(formData.get("sourceType") ?? "upload") as AnalysisSource;

  if (!file || !studentId) {
    return NextResponse.json({ error: "missing_file_or_student" }, { status: 400 });
  }

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
