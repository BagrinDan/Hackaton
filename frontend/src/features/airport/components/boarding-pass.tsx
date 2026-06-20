import {
  IconId,
  IconStarFilled,
  IconWheelchair,
  IconCake,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import type { GuestProfile } from "@/types/guest";
import { PassField } from "@/components/pass-field";

export function BoardingPass({ guest }: { guest: GuestProfile }) {
  return (
    <div
      data-testid="boarding-pass"
      className="overflow-hidden rounded-xl border border-border/60 shadow-sm"
    >
      <div className="flex items-center justify-between bg-primary px-4 py-2.5">
        <span className="text-xs font-semibold tracking-widest text-primary-foreground/90 uppercase">
          Boarding Pass
        </span>
        <Badge className="rounded-full border-0 bg-primary-foreground/20 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-primary-foreground uppercase">
          {guest.priority === "fast" ? "Fast Pass" : "Standard"}
        </Badge>
      </div>

      <div className="bg-background/70 px-4 pt-3 pb-1">
        <p className="font-display text-lg leading-tight font-semibold text-foreground">
          {guest.name} {guest.surname}
        </p>
        <p className="mb-3 text-xs text-muted-foreground">
          Resort guest · {guest.id}
        </p>
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
        <PassField icon={IconId} label="Passport" value={guest.passport} />
        <PassField icon={IconCake} label="Age" value={String(guest.age)} />
        <PassField
          icon={IconStarFilled}
          label="Priority"
          value={guest.priority}
        />
        <PassField
          icon={IconWheelchair}
          label="Access"
          value={guest.disability ? "Accessible" : "Standard"}
        />
      </div>
    </div>
  );
}
