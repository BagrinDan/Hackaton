import type { AdminMetricsResponse } from "@/features/parrot/types";
import { cn } from "@/lib/utils";

interface QualityItem {
  label: string;
  total: number;
  conversations: number;
}

export function ParrotQualityRow({
  metrics,
}: {
  metrics: AdminMetricsResponse;
}) {
  const items: QualityItem[] = [
    {
      label: "Tool errors",
      total: metrics.tool_errors_total,
      conversations: metrics.conversations_with_tool_error,
    },
    {
      label: "Fallbacks",
      total: metrics.fallback_total,
      conversations: metrics.conversations_with_fallback,
    },
    {
      label: "Censored",
      total: metrics.censored_messages_total,
      conversations: metrics.conversations_with_censored,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => {
        const flagged = item.total > 0;
        return (
          <div
            key={item.label}
            className={cn("flex flex-col gap-0.5 rounded-xl border p-3", {
              "border-destructive/20 bg-destructive/5": flagged,
            })}
          >
            <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
              {item.label}
            </span>
            <span
              className={cn("text-lg leading-none font-bold tabular-nums", {
                "text-destructive": flagged,
                "text-muted-foreground/60": !flagged,
              })}
            >
              {item.total}
            </span>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {item.conversations} convos
            </span>
          </div>
        );
      })}
    </div>
  );
}
