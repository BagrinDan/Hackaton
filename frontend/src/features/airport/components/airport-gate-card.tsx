import type { GateStatus } from "@/features/airport/types";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_GUESTS = 5;

export function AirportGateCard({ gate }: { gate: GateStatus }) {
  const isEu = gate.gate_type === "EU";

  return (
    <div
      className={cn("flex flex-col gap-3 rounded-xl border p-4", {
        "border-sky-300/70 bg-sky-50/80 dark:border-sky-700/40 dark:bg-sky-950/30":
          isEu,
        "border-amber-300/70 bg-amber-50/80 dark:border-amber-700/40 dark:bg-amber-950/30":
          !isEu,
      })}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-display rounded-md border px-2 py-0.5 text-sm font-semibold tracking-wide",
                {
                  "border-sky-500/25 bg-sky-500/15 text-sky-700 dark:text-sky-300":
                    isEu,
                  "border-amber-500/25 bg-amber-500/15 text-amber-700 dark:text-amber-300":
                    !isEu,
                }
              )}
            >
              {isEu ? "EU Gate" : "Non-EU Gate"}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
              {gate.gate_id}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {isEu ? "European passports" : "All other passports"}
          </p>
        </div>
        <div className="text-right">
          <p
            data-testid="gate-queue-size"
            className="font-display text-2xl leading-none font-bold text-foreground"
          >
            {gate.queue_size}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase">queued</p>
        </div>
      </div>

      {gate.queue.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {gate.queue.slice(0, MAX_VISIBLE_GUESTS).map((guest) => (
            <li
              key={guest.guest_id}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 text-muted-foreground/60 tabular-nums">
                  #{guest.position}
                </span>
                <span className="truncate font-medium text-foreground">
                  {guest.name} {guest.surname}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {guest.disability && (
                  <span className="rounded bg-blue-500/10 px-1 py-0.5 text-[10px] text-blue-600 dark:text-blue-400">
                    accessibility
                  </span>
                )}
                <span
                  className={cn(
                    "rounded px-1 py-0.5 text-[10px]",
                    guest.priority === "fast"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {guest.priority}
                </span>
              </div>
            </li>
          ))}
          {gate.queue.length > MAX_VISIBLE_GUESTS && (
            <li className="text-[11px] text-muted-foreground/60">
              +{gate.queue.length - MAX_VISIBLE_GUESTS} more
            </li>
          )}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground/60">No guests queued.</p>
      )}
    </div>
  );
}
