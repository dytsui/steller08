import { NextResponse } from "next/server";
import { exec, many } from "@/lib/db";
import { getRequestScope } from "@/lib/scope";
import { nowIso, uid } from "@/lib/utils";

export async function GET() {
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await many(
    `SELECT s.* FROM sessions s JOIN students st ON st.id=s.student_id WHERE ${scope.canReadAll ? "1=1" : scope.role === "pro" ? "st.coach_user_id=?" : "st.user_id=?"} ORDER BY s.created_at DESC`,
    scope.canReadAll ? [] : [scope.userId]
  );
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as { studentId: string; sourceType: "upload" | "capture"; videoKey: string };
  const id = uid("ses");
  await exec("INSERT INTO sessions (id, student_id, source_type, status, video_key, created_at, updated_at) VALUES (?, ?, ?, 'created', ?, ?, ?)", [id, body.studentId, body.sourceType, body.videoKey, nowIso(), nowIso()]);
  return NextResponse.json({ sessionId: id }, { status: 201 });
}
