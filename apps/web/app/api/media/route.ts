import { NextResponse } from "next/server";
import { getRequestScope } from "@/lib/scope";
import { createMediaSession } from "@/lib/services";

export async function POST(req: Request) {
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  const studentId = String(form.get("studentId") ?? "");
  const sourceType = (String(form.get("sourceType") ?? "upload") === "capture" ? "capture" : "upload") as "upload" | "capture";
  if (!(file instanceof File)) return NextResponse.json({ error: "File required" }, { status: 400 });

  const session = await createMediaSession(scope, {
    studentId,
    sourceType,
    fileName: file.name,
    contentType: file.type || "video/mp4",
    buffer: await file.arrayBuffer()
  });

  return NextResponse.json(session, { status: 201 });
}
