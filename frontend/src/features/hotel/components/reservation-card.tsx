import type { ReactNode } from "react";

interface ReservationCardProps {
  headerLabel: string;
  headerBadge: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function ReservationCard({
  headerLabel,
  headerBadge,
  title,
  subtitle,
  children,
  footer,
}: ReservationCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 shadow-sm">
      <div className="flex items-center justify-between bg-(--zone-accent) px-4 py-2.5">
        <span className="text-xs font-semibold tracking-widest text-primary-foreground/90 uppercase">
          {headerLabel}
        </span>
        {headerBadge}
      </div>

      <div className="bg-background/70 px-4 pt-3 pb-1">
        <p className="font-display text-lg leading-tight font-semibold text-foreground">
          {title}
        </p>
        <p className="mb-3 text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <div className="relative mx-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dashed border-border/70" />
        </div>
        <div className="relative flex justify-between">
          <div className="size-3 -translate-x-4 rounded-full border border-border/60 bg-background" />
          <div className="size-3 translate-x-4 rounded-full border border-border/60 bg-background" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 bg-background/70 px-4 pt-3 pb-4">
        {children}
      </div>

      {footer && (
        <div className="border-t border-border/40 bg-background/70 px-4 pt-3 pb-4">
          {footer}
        </div>
      )}
    </div>
  );
}
