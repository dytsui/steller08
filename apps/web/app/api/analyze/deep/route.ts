import { NextResponse } from "next/server";
import { callDeepAnalyzer } from "@/lib/analyzer";
import { getSession, updateSessionStatus, writeAnalysis } from "@/lib/d1";
import { getEnv } from "@/lib/cloudflare";
import { makeKeyframeKey, uploadMedia } from "@/lib/r2";
import { generateReport } from "@/lib/report";

export async function POST(request: Request) {
  const body = await request.json() as { sessionId: string };
  const session = await getSession(body.sessionId);
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
