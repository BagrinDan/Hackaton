export function ParrotToolBreakdown({
  byName,
}: {
  byName: Record<string, number>;
}) {
  const entries = Object.entries(byName).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return (
      <p className="text-xs text-muted-foreground/60">No tool calls recorded.</p>
    );
  }

  const max = Math.max(...entries.map(([, count]) => count));

  return (
    <div className="flex flex-col gap-2">
      {entries.map(([name, count]) => (
        <div key={name} className="flex items-center gap-3">
          <span className="w-48 shrink-0 truncate font-mono text-xs text-foreground">
            {name}
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-(--zone-accent)"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="w-6 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
            {count}
          </span>
        </div>
      ))}
    </div>
  );
}
