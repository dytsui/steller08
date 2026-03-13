import type { AnalysisResult } from "@/lib/types";
import { getEnv } from "@/lib/cloudflare";

type DeepAnalyzerUploadPayload = {
  sessionId: string;
  studentId: string;
  sourceType: string;
  fileName: string;
  contentType?: string;
  file: ArrayBuffer | Uint8Array | Blob;
};

export async function callDeepAnalyzer(payload: DeepAnalyzerUploadPayload): Promise<AnalysisResult> {
  const env = getEnv();
  const base = env.ANALYZER_BASE_URL;
  if (!base) {
    throw new Error("ANALYZER_BASE_URL 未配置");
  }

  const form = new FormData();
  form.set("sessionId", payload.sessionId);
  form.set("studentId", payload.studentId);
  form.set("sourceType", payload.sourceType);

  const blob = payload.file instanceof Blob
    ? payload.file
    : new Blob([payload.file], { type: payload.contentType || "video/mp4" });

  form.set("file", blob, payload.fileName || "video.mp4");

  const response = await fetch(`${base}/v1/analyze/upload`, {
    method: "POST",
    headers: env.ANALYZER_TOKEN
      ? { "Authorization": `Bearer ${env.ANALYZER_TOKEN}` }
      : undefined,
    body: form
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json() as AnalysisResult;
}
