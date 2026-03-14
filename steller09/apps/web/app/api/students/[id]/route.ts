import { NextResponse } from "next/server";
import { exec } from "@/lib/db";
import { getRequestScope } from "@/lib/scope";
import { nowIso } from "@/lib/utils";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const body = (await req.json()) as { notes?: string; level?: string };
  await exec("UPDATE students SET notes=COALESCE(?,notes), level=COALESCE(?,level), updated_at=? WHERE id=?", [body.notes ?? null, body.level ?? null, nowIso(), id]);
  return NextResponse.json({ ok: true });
}
