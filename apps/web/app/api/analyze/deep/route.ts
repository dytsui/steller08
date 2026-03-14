import { NextResponse } from "next/server";
import { getRequestScope } from "@/lib/scope";
import { analyzeDeep } from "@/lib/services";

export async function POST(req: Request) {
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as { sessionId: string };
  try {
    return NextResponse.json(await analyzeDeep(scope, body));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "deep analyze failed" }, { status: 500 });
  }
}
