export function GrowthChart({ points }: { points: Array<{ score: number; tempoRatio: number; issueCount: number }> }) {
  const max = Math.max(100, ...points.map((p) => p.score));
  return (
    <div className="chart">
      {points.map((point, index) => (
        <div key={index}>
          <div className="chart-bar" style={{ height: `${Math.max(20, (point.score / max) * 220)}px` }} />
          <div className="muted">{point.score}</div>
        </div>
      ))}
    </div>
  );
}
