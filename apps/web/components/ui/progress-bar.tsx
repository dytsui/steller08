export function ProgressBar({ value }: { value: number }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="progress-shell">
      <div className="progress-fill" style={{ width: `${width}%` }} />
    </div>
  );
}
