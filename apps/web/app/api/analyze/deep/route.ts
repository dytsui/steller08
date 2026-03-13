import { NextResponse } from 'next/server';
import { callDeepAnalyzer } from '@/lib/analyzer';
import { getSessionForScope, markSessionCompleted, markSessionFailed, updateSessionStatus, writeAnalysis } from '@/lib/d1';
import { generateReport } from '@/lib/report';
import { makeKeyframeKey, readMedia, uploadMedia } from '@/lib/r2';
import { getRequestScope } from '@/lib/scope';

export async function POST(request: Request) {
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json() as { sessionId: string };
  const session = await getSessionForScope(body.sessionId, scope);
  if (!session) {
    return NextResponse.json({ error: 'session_not_found' }, { status: 404 });
  }

  await updateSessionStatus(session.id, 'analyzing-deep');

  try {
    const source = await readMedia('VIDEOS', session.videoKey);
    if (!source) {
      await markSessionFailed(session.id, 'video_not_found');
      return NextResponse.json({ error: 'video_not_found' }, { status: 404 });
    }

    const contentType = (source as any).httpMetadata?.contentType || 'video/mp4';
    const fileBuffer = await source.arrayBuffer();

    const result = await callDeepAnalyzer({
      sessionId: session.id,
      studentId: session.studentId,
      sourceType: session.sourceType,
      file: fileBuffer,
      contentType,
      fileName: session.videoKey.split('/').at(-1) || 'video.mp4'
    });

    for (const frame of result.keyframes) {
      if (!frame.imageBase64) continue;
      const binary = Buffer.from(frame.imageBase64, 'base64');
      const key = makeKeyframeKey(result.sessionId, frame.label);
      await uploadMedia('KEYFRAMES', key, binary, 'image/jpeg');
      frame.imageKey = key;
      delete frame.imageBase64;
    }

    try {
      const ai = await generateReport(result);
      result.reportZh = ai.zh;
      result.reportEn = ai.en;
    } catch {
      // keep structured rule output when Gemini is unavailable
    }

    await writeAnalysis(result);
    await markSessionCompleted({
      sessionId: session.id,
      score: result.score,
      tempoRatio: result.tempoRatio,
      durationMs: session.durationMs ?? undefined
    });
    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'deep_analysis_failed';
    await markSessionFailed(session.id, message);
    return NextResponse.json({ error: 'deep_analysis_failed', detail: message }, { status: 502 });
  }
}
