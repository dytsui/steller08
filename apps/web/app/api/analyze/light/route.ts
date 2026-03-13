import { NextResponse } from "next/server";
import { writeAnalysis, updateSessionStatus } from "@/lib/d1";
import { runLightAnalysis } from "@/lib/light-analysis";
import type { AnalysisSource, AnalysisResult } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json() as {
    sessionId: string;
    studentId: string;
    sourceType: AnalysisSource;
    durationMs?: number;
    snapshot?: {
      phaseDetected?: string;
      score?: number;
      keyframes?: AnalysisResult["keyframes"];
      metrics?: AnalysisResult["metrics"];
    };
  };

  if (!body.sessionId || !body.studentId || !body.snapshot?.metrics || !body.snapshot.phaseDetected) {
    return NextResponse.json({ error: "real_snapshot_required" }, { status: 400 });
  }

  const result = runLightAnalysis({
    sessionId: body.sessionId,
    studentId: body.studentId,
    sourceType: body.sourceType,
    durationMs: body.durationMs ?? 2000,
    snapshot: {
      phaseDetected: body.snapshot.phaseDetected,
      score: body.snapshot.score,
      metrics: body.snapshot.metrics,
      keyframes: body.snapshot.keyframes
    }
  });
  await updateSessionStatus(body.sessionId, "analyzing-light");
  await writeAnalysis(result);
  return NextResponse.json({ result });
}
