import { cn } from "@/lib/utils";
import type { ConnectionStatus as Status } from "@/types/broadcast";

const LABELS: Record<Status, string> = {
  connected: "Live",
  reconnecting: "Reconnecting…",
  dropped: "Offline",
};

export function ConnectionStatus({ status }: { status: Status }) {
  return (
    <div
      data-testid="sse-status"
      data-status={status}
      className="fixed bottom-24 left-6 z-50 flex items-center gap-2 rounded-full bg-sidebar/90 px-3 py-1.5 text-xs shadow-lg backdrop-blur-sm"
    >
      <span
        className={cn("size-2 rounded-full", {
          "bg-emerald-500": status === "connected",
          "bg-amber-500": status === "reconnecting",
          "bg-red-500": status === "dropped",
        })}
      />
      <span className="text-sidebar-foreground/80">{LABELS[status]}</span>
    </div>
  );
}
