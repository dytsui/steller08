export async function fetchHistory(studentId?: string) {
  const suffix = studentId ? `?studentId=${studentId}` : "";
  const res = await fetch(`/api/history${suffix}`, { cache: "no-store" });
  return await res.json();
}
