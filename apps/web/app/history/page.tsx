async function getHistory() {
  const res = await fetch("http://localhost:3000/api/history", { cache: "no-store" }).catch(() => null);
  if (!res || !res.ok) return [] as Array<Record<string, unknown>>;
  return (await res.json()).items as Array<Record<string, unknown>>;
}

export default async function HistoryPage() {
  const items = await getHistory();
  return (
    <div>
      <h2>历史记录</h2>
      {items.map((item, idx) => (
        <div key={idx} className="card"><pre>{JSON.stringify(item, null, 2)}</pre></div>
      ))}
    </div>
  );
}
