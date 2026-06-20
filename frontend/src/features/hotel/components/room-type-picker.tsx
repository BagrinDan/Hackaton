import { Controller, type Control } from "react-hook-form";
import { cn } from "@/lib/utils";
import { IconBed, IconBedFlat, IconCrown } from "@tabler/icons-react";
import type { ReservationFormValues } from "@/features/hotel/schemas/reservation-form-schema";
import { ROOM_TYPES, type RoomType } from "@/features/hotel/types";

const ROOM_TYPE_OPTIONS: Record<
  RoomType,
  { label: string; sub: string; Icon: typeof IconBed }
> = {
  STANDARD: { label: "Standard", sub: "1 queen bed", Icon: IconBed },
  DELUXE: { label: "Deluxe", sub: "1 king bed", Icon: IconBedFlat },
  SUITE: { label: "Suite", sub: "King + lounge", Icon: IconCrown },
};

interface RoomTypePickerProps {
  control: Control<ReservationFormValues>;
  disabled?: boolean;
}

export function RoomTypePicker({ control, disabled }: RoomTypePickerProps) {
  return (
    <Controller
      name="room_type"
      control={control}
      render={({ field }) => (
        <div className="grid grid-cols-3 gap-2">
          {ROOM_TYPES.map((value) => {
            const { label, sub, Icon } = ROOM_TYPE_OPTIONS[value];
            const selected = field.value === value;
            return (
              <button
                key={value}
                type="button"
                disabled={disabled}
                onClick={() => field.onChange(value)}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-center transition-all duration-150",
                  selected
                    ? "border-(--zone-accent) bg-[color-mix(in_srgb,var(--zone-accent)_10%,transparent)] shadow-sm"
                    : "border-border bg-muted/40 hover:border-(--zone-accent)/50 hover:bg-muted/70",
                  disabled && "cursor-not-allowed opacity-50"
                )}
              >
                <Icon
                  size={20}
                  stroke={selected ? 2 : 1.5}
                  className={
                    selected ? "text-(--zone-accent)" : "text-muted-foreground"
                  }
                />
                <span
                  className={cn(
                    "text-xs leading-none font-semibold",
                    selected ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
                <span className="text-[10px] leading-none text-muted-foreground">
                  {sub}
                </span>
              </button>
            );
          })}
        </div>
      )}
    />
  );
}
