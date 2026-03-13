import { NextResponse } from "next/server";
import { getAnalysis, writeAnalysis } from "@/lib/d1";
import { generateReport } from "@/lib/report";

export async function POST(request: Request) {
  const body = await request.json() as { sessionId: string };
  const analysis = await getAnalysis(body.sessionId);
  if (!analysis) return NextResponse.json({ error: "analysis_not_found" }, { status: 404 });
  const report = await generateReport(analysis);
  analysis.reportZh = report.zh;
  analysis.reportEn = report.en;
  await writeAnalysis(analysis);
  return NextResponse.json(report);
}
