import { getEnv } from "@/lib/cloudflare";
import type { AnalysisResult } from "@/lib/types";

function buildPrompt(result: AnalysisResult) {
  return [
    "你是高尔夫教练报告生成器。",
    "只能基于给定结构化分析写报告，禁止虚构不存在的数据。",
    "输出一段中文总结和三条训练建议。",
    JSON.stringify({
      sessionId: result.sessionId,
      sourceType: result.sourceType,
      score: result.score,
      tempoRatio: result.tempoRatio,
      metrics: result.metrics,
      issues: result.issues,
      trainingPlanZh: result.trainingPlanZh
    })
  ].join("\n");
}

export async function generateReport(result: AnalysisResult) {
  const env = getEnv();
  if (!env.GEMINI_API_KEY || !env.GEMINI_API_BASE || !env.GEMINI_MODEL) {
    return { zh: result.reportZh, en: result.reportEn, provider: "rules" };
  }

  const response = await fetch(`${env.GEMINI_API_BASE}/models/${env.GEMINI_MODEL}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(result) }] }],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "text/plain"
      }
    })
  });

  if (!response.ok) {
    throw new Error(`gemini_error:${response.status}`);
  }

  const json = await response.json() as any;
  const text = json?.candidates?.[0]?.content?.parts?.map((part: any) => part.text ?? "").join("").trim();
  if (!text) {
    throw new Error("gemini_empty_response");
  }

  return {
    zh: text,
    en: result.reportEn,
    provider: "gemini"
  };
}
