import { NextResponse } from "next/server";
import { getGrowth, listHistory } from "@/lib/d1";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const studentId = url.searchParams.get("studentId") ?? undefined;
  const history = await listHistory(studentId);
  const growth = studentId ? await getGrowth(studentId) : [];
  return NextResponse.json({ history, growth });
}
