import { IconCircleCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import type { ArrivalStatus } from "@/features/airport/types";

interface ArrivalStatusProps {
  status: ArrivalStatus;
}

export function ArrivalStatusCard({ status }: ArrivalStatusProps) {
  if (status.status === "processed") {
    return (
      <div
        data-testid="arrival-status"
        className="flex items-center gap-3 rounded-lg bg-background/80 px-4 py-3"
      >
        <IconCircleCheck size={20} className="text-(--zone-accent)" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Cleared at gate <span data-testid="arrival-gate">{status.gate}</span>
          </p>
          <p className="text-xs text-muted-foreground">You're on the island.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="arrival-status"
      className="flex flex-col gap-1 rounded-lg bg-background/80 px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="border-(--zone-accent) text-(--zone-accent)"
        >
          {status.status === "processing" ? "Processing" : "Queued"}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Gate <span data-testid="arrival-gate">{status.gate}</span>
        </span>
      </div>
      {status.position !== null && (
        <p className="text-sm font-medium text-foreground">
          Position{" "}
          <span className="text-(--zone-accent)">#{status.position}</span>
        </p>
      )}
    </div>
  );
}
