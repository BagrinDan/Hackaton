import { IconAlertCircle } from "@tabler/icons-react";

import { Spinner } from "@/components/ui/spinner";
import { AirportGateCard } from "@/features/airport/components/airport-gate-card";
import { useQueue } from "@/features/airport/hooks/use-airport";

export function AirportAdminQueueSummary() {
  const { data: queue, isLoading, error } = useQueue();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!queue) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <IconAlertCircle
            size={16}
            className="mt-0.5 shrink-0 text-destructive"
          />
          <p>{error?.message ?? "Queue state could not be loaded."}</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="airport-queue-summary" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-medium">
          Departure queues
        </span>
        <span data-testid="queue-total" className="text-xs text-muted-foreground">
          {queue.total_queued + 1} total
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {queue.gates.map((gate) => (
          <div data-testid={`gate-row-${gate.gate_id}`} key={gate.gate_id}>
            <AirportGateCard gate={gate} />
          </div>
        ))}
      </div>
    </div>
  );
}
