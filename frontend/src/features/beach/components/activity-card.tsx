import type { Activity } from "@/features/beach/types";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  activity: Activity;
  action?: React.ReactNode;
  isBooked?: boolean;
}

export function ActivityCard({
  activity,
  action,
  isBooked,
}: ActivityCardProps) {
  const { activity_name, description, capacity, remaining } = activity;

  const isFull = remaining === 0;
  const filled = capacity > 0 ? (capacity - remaining) / capacity : 1;
  const barColor =
    filled >= 1
      ? "bg-destructive"
      : filled >= 0.8
        ? "bg-amber-400"
        : "bg-(--zone-accent)";

  return (
    <div
      data-testid={`activity-card-${activity.activity_id}`}
      className={cn(
        "flex flex-col gap-2 rounded-md border-2 bg-background/70 px-4 py-3 transition-colors",
        isBooked
          ? "border-(--zone-accent)/60 bg-[color-mix(in_srgb,var(--zone-accent)_6%,transparent)]"
          : "border-border/60"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <p
            className={cn(
              "text-sm font-semibold",
              isBooked ? "text-(--zone-accent)" : "text-foreground"
            )}
          >
            {activity_name}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>

      <div className="flex items-center gap-2 pt-0.5">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              barColor
            )}
            style={{ width: `${filled * 100}%` }}
          />
        </div>
        <span
          data-testid="activity-remaining"
          className={cn(
            "shrink-0 text-xs tabular-nums",
            isFull ? "font-medium text-destructive" : "text-muted-foreground"
          )}
        >
          {isFull ? "Full" : `${remaining} left`}
        </span>
      </div>
    </div>
  );
}
