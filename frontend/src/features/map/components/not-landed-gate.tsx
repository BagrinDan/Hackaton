import { IconPlaneDeparture } from "@tabler/icons-react";

export function NotLandedGate() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 bg-accent/30 px-5 py-6 text-center">
      <IconPlaneDeparture size={20} className="text-muted-foreground/60" />
      <p className="text-sm font-medium text-foreground">
        You haven't landed yet
      </p>
      <p className="text-xs text-muted-foreground">
        Clear the airport queue first to unlock this zone.
      </p>
    </div>
  );
}
