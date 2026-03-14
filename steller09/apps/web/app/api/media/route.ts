import { NextResponse } from "next/server";
import { getRequestScope } from "@/lib/scope";
import { createMediaSession } from "@/lib/services";

export async function POST(req: Request) {
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "file required" }, { status: 400 });
  const studentId = String(form.get("studentId") ?? "");
  const sourceType = String(form.get("sourceType") ?? "upload") === "capture" ? "capture" : "upload";
  return NextResponse.json(await createMediaSession(scope, { studentId, file, sourceType }), { status: 201 });
}
