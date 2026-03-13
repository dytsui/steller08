import type { AnalysisResult } from "@/lib/types";
import { getEnv } from "@/lib/cloudflare";

export async function callDeepAnalyzer(payload: {
  sessionId: string;
  studentId: string;
  sourceType: string;
  videoUrl: string;
  fileName: string;
}): Promise<AnalysisResult> {
  const env = getEnv();
  const base = env.ANALYZER_BASE_URL;
  if (!base) {
    throw new Error("ANALYZER_BASE_URL 未配置");
  }

  const response = await fetch(`${base}/v1/analyze/url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.ANALYZER_TOKEN ?? ""}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json() as AnalysisResult;
}
