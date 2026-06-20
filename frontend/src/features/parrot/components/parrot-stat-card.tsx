interface ParrotStatCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

export function ParrotStatCard({ label, value, hint }: ParrotStatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-(--zone-accent)/10 p-4">
      <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <span className="font-display text-2xl leading-none font-semibold text-foreground tabular-nums">
        {value}
      </span>
      {hint && (
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {hint}
        </span>
      )}
    </div>
  );
}
