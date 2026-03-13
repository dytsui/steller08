import { NextResponse } from 'next/server';
import { getSessionForScope, updateSessionLightSummary, updateSessionStatus, writeAnalysis } from '@/lib/d1';
import { runLightAnalysis } from '@/lib/light-analysis';
import { getRequestScope } from '@/lib/scope';
import type { AnalysisSource, AnalysisResult } from '@/lib/types';

export async function POST(request: Request) {
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json() as {
    sessionId: string;
    studentId: string;
    sourceType: AnalysisSource;
    durationMs?: number;
    snapshot?: {
      phaseDetected?: string;
      score?: number;
      keyframes?: AnalysisResult['keyframes'];
      metrics?: AnalysisResult['metrics'];
    };
  };

  if (!body.sessionId || !body.studentId || !body.snapshot?.metrics || !body.snapshot.phaseDetected) {
    return NextResponse.json({ error: 'real_snapshot_required' }, { status: 400 });
  }

  const session = await getSessionForScope(body.sessionId, scope);
  if (!session) return NextResponse.json({ error: 'session_not_found' }, { status: 404 });
  if (session.studentId !== body.studentId || session.sourceType !== body.sourceType) {
    return NextResponse.json({ error: 'session_payload_mismatch' }, { status: 400 });
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

  await updateSessionStatus(body.sessionId, 'analyzing-light');
  await updateSessionLightSummary({
    sessionId: body.sessionId,
    score: result.score,
    tempoRatio: result.tempoRatio,
    durationMs: body.durationMs
  });
  await writeAnalysis(result);
  return NextResponse.json({ result });
}
