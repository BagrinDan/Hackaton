import { IconBed } from "@tabler/icons-react";

export function NotCheckedInGate() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 bg-accent/30 px-5 py-6 text-center">
      <IconBed size={20} className="text-muted-foreground/60" />
      <p className="text-sm font-medium text-foreground">Not checked in yet</p>
      <p className="text-xs text-muted-foreground">
        Book a hotel room first to access beach activities.
      </p>
    </div>
  );
}
