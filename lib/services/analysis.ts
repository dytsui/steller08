export async function fetchAnalysis(id: string) {
  const res = await fetch(`/api/analysis/${id}`, { cache: "no-store" });
  return await res.json();
}

export async function runLight(sessionId: string, studentId: string, sourceType: string, durationMs: number) {
  const res = await fetch("/api/analyze/light", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, studentId, sourceType, durationMs })
  });
  return await res.json();
}

export async function runDeep(sessionId: string) {
  const res = await fetch("/api/analyze/deep", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId })
  });
  return await res.json();
}
