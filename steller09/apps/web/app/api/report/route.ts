import { NextResponse } from "next/server";
import { getRequestScope } from "@/lib/scope";
import { generateReport } from "@/lib/services";

export async function POST(req: Request){
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json()) as { sessionId: string };
  return NextResponse.json(await generateReport(scope, body.sessionId));
}
