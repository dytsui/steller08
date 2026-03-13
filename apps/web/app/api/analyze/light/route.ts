import { NextResponse } from "next/server";
import { getCurrentSessionPayload } from '@/lib/auth';
import { getSessionForScope, updateSessionStatus, writeAnalysis } from "@/lib/d1";
import { runLightAnalysis } from "@/lib/light-analysis";
import type { AnalysisSource, AnalysisResult } from "@/lib/types";

function scopeFromPayload(payload: Awaited<ReturnType<typeof getCurrentSessionPayload>>) {
  if (!payload) return null;
  if (payload.role === 'admin') return { role: 'admin' as const, userId: payload.userId };
  if (payload.role === 'pro') return { role: 'pro' as const, userId: payload.userId };
  return { role: 'user' as const, userId: payload.userId };
}

export async function POST(request: Request) {
  const payload = await getCurrentSessionPayload();
  const scope = scopeFromPayload(payload);
  if (!scope) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
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
  const session = await getSessionForScope(body.sessionId, scope);
  if (!session) return NextResponse.json({ error: 'session_not_found' }, { status: 404 });

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
  await updateSessionStatus(body.sessionId, 'analyzing-light');
  return NextResponse.json({ result });
}
