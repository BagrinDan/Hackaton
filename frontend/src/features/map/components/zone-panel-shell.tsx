import { useEffect, type ReactNode } from "react";
import { IconX } from "@tabler/icons-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type ZoneId } from "@/features/map/constants";
import { getZone } from "@/features/map/zone-registry";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/stores/session-selectors";

interface ZonePanelShellProps {
  zoneId: ZoneId | null;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function ZonePanelShell({
  zoneId,
  open,
  onClose,
  children,
}: ZonePanelShellProps) {
  const config = zoneId ? getZone(zoneId) : null;
  const isAdmin = useIsAdmin();
  const accent = config?.accent ?? "#34d399";
  const description = isAdmin ? config?.adminDescription : config?.description;

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <div
      data-testid="zone-panel"
      data-open={open}
      className={cn(
        "fixed top-3 right-3 bottom-3 z-50 flex w-[720px] flex-col rounded-2xl p-3 transition-transform duration-300 ease-in-out [background:var(--wood-gradient)]",
        open
          ? "translate-x-0 shadow-(--wood-shadow)"
          : "translate-x-[calc(100%_+_12px)] shadow-none"
      )}
      style={{ "--zone-accent": accent } as React.CSSProperties}
    >
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-background/95">
        <div className="zone-accent-header relative shrink-0 overflow-hidden px-7 pt-8 pb-6">
          <div className="absolute top-0 right-0 h-36 w-36 translate-x-10 -translate-y-10 rounded-full bg-(--zone-accent) opacity-10" />
          <button
            onClick={onClose}
            data-testid="zone-panel-close"
            className="wood-icon-btn absolute top-4 right-4 z-10 cursor-pointer rounded-full p-2 transition-opacity hover:opacity-80"
          >
            <IconX size={16} stroke={2.5} />
          </button>
          {config && (
            <config.icon
              size={40}
              stroke={1.5}
              className="text-(--zone-accent)"
            />
          )}
          <h2
            data-testid="zone-panel-title"
            className="mt-2 text-3xl font-bold tracking-tight text-foreground"
          >
            {config?.label}
          </h2>
          {description && (
            <p
              data-testid="zone-panel-desc"
              className="mt-3 text-sm leading-relaxed text-muted-foreground"
            >
              {description}
            </p>
          )}
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-6 px-7 py-6">{children}</div>
        </ScrollArea>
      </div>
    </div>
  );
}
