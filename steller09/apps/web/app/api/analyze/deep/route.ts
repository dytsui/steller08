import { NextResponse } from "next/server";
import { getRequestScope } from "@/lib/scope";
import { analyzeDeep } from "@/lib/services";

export async function POST(req: Request){
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json()) as { sessionId: string };
  try { return NextResponse.json(await analyzeDeep(scope, body.sessionId)); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "deep failed" }, { status: 500 }); }
}
