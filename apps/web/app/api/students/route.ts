import { NextResponse } from "next/server";
import { getRequestScope } from "@/lib/scope";
import { createStudent, listStudents } from "@/lib/services";

export async function GET() {
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ items: await listStudents(scope) });
}

export async function POST(req: Request) {
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as { name: string; level: string; dominantHand: string; handicap: string; notes?: string };
  const item = await createStudent(scope, { ...body, handicap: Number(body.handicap) });
  return NextResponse.json(item, { status: 201 });
}
