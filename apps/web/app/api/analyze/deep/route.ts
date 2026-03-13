import { NextResponse } from "next/server";
import { getCurrentSessionPayload } from '@/lib/auth';
import { callDeepAnalyzer } from "@/lib/analyzer";
import { getSessionForScope, updateSessionStatus, writeAnalysis } from "@/lib/d1";
import { getEnv } from "@/lib/cloudflare";
import { makeKeyframeKey, uploadMedia } from "@/lib/r2";
import { generateReport } from "@/lib/report";

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
  const body = await request.json() as { sessionId: string };
  const session = await getSessionForScope(body.sessionId, scope);
  if (!session) {
    return NextResponse.json({ error: "session_not_found" }, { status: 404 });
  }
  await updateSessionStatus(session.id, "analyzing-deep");
  const env = getEnv();
  const videoUrl = `${env.NEXT_PUBLIC_APP_URL}/api/media?bucket=VIDEOS&key=${encodeURIComponent(session.videoKey)}`;
  const result = await callDeepAnalyzer({
    sessionId: session.id,
    studentId: session.studentId,
    sourceType: session.sourceType,
    videoUrl,
    fileName: session.videoKey.split("/").at(-1) || "video.mp4"
  });

  for (const frame of result.keyframes) {
    if (!frame.imageBase64) continue;
    const binary = Buffer.from(frame.imageBase64, "base64");
    const key = makeKeyframeKey(result.sessionId, frame.label);
    await uploadMedia("KEYFRAMES", key, binary, "image/jpeg");
    frame.imageKey = key;
    delete frame.imageBase64;
  }

  try {
    const ai = await generateReport(result);
    result.reportZh = ai.zh;
  } catch {
    // keep structured rule-based report when Gemini is unavailable
  }

  await writeAnalysis(result);
  return NextResponse.json({ result });
}
