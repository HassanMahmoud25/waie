export function ProgressBar({ percent, className = "mt-2 h-1 max-w-40" }: { percent: number; className?: string }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div
      className={`overflow-hidden rounded-full bg-[var(--surface)] ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full bg-[var(--accent)]" style={{ width: `${clamped}%` }} />
    </div>
  );
}
