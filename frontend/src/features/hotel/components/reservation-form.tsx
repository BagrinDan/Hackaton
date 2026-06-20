import { type UseFormReturn } from "react-hook-form";
import { differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  IconLoader2,
  IconCalendarCheck,
  IconArrowRight,
} from "@tabler/icons-react";
import type { ReservationFormValues } from "@/features/hotel/schemas/reservation-form-schema";
import { DateField } from "./date-field";
import { RoomTypePicker } from "./room-type-picker";
import { GuestStepper } from "./guest-stepper";

const fieldLabelCn =
  "text-xs font-semibold uppercase tracking-wider text-muted-foreground";

interface ReservationFormProps {
  form: UseFormReturn<ReservationFormValues>;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
}

export function ReservationForm({
  form,
  onSubmit,
  isSubmitting,
}: ReservationFormProps) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const guestCount = watch("guest_count") ?? 1;
  const checkIn = watch("check_in_date");
  const checkOut = watch("check_out_date");
  const nights =
    checkIn && checkOut && checkOut > checkIn
      ? differenceInDays(checkOut, checkIn)
      : null;

  return (
    <form
      onSubmit={onSubmit}
      data-testid="reservation-form"
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-2" data-testid="room-type">
        <Label className={fieldLabelCn}>Room type</Label>
        <RoomTypePicker control={control} disabled={isSubmitting} />
      </div>

      <div className="flex flex-col gap-2">
        <Label className={fieldLabelCn}>Dates</Label>
        <div className="flex items-start gap-2">
          <div className="flex-1" data-testid="checkin-date">
            <DateField
              name="check_in_date"
              label="Check-in"
              control={control}
              error={errors.check_in_date?.message}
              disabled={isSubmitting}
            />
          </div>
          <div className="mt-7 flex flex-col items-center gap-0.5">
            <IconArrowRight size={14} className="text-muted-foreground" />
            {nights !== null && (
              <span className="rounded-full bg-[color-mix(in_srgb,var(--zone-accent)_15%,transparent)] px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-(--zone-accent)">
                {nights}n
              </span>
            )}
          </div>
          <div className="flex-1" data-testid="checkout-date">
            <DateField
              name="check_out_date"
              label="Check-out"
              control={control}
              error={errors.check_out_date?.message}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2" data-testid="guest-count">
        <Label className={fieldLabelCn}>Guests</Label>
        <GuestStepper
          value={guestCount}
          onChange={(v) => setValue("guest_count", v)}
          disabled={isSubmitting}
        />
        {errors.guest_count && (
          <p className="text-xs text-destructive">
            {errors.guest_count.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        data-testid="reservation-submit"
        disabled={isSubmitting}
        className="w-full cursor-pointer bg-(--zone-accent) text-white"
      >
        {isSubmitting ? (
          <>
            <IconLoader2 size={16} className="mr-2 animate-spin" />
            Booking…
          </>
        ) : (
          <>
            <IconCalendarCheck size={16} className="mr-2" />
            {nights
              ? `Book ${nights} night${nights > 1 ? "s" : ""}`
              : "Book room"}
          </>
        )}
      </Button>
    </form>
  );
}
