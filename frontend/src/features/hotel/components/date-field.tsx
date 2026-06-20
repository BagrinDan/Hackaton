import { format } from "date-fns";
import { Controller, type Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ReservationFormValues } from "@/features/hotel/schemas/reservation-form-schema";

interface DateFieldProps {
  name: "check_in_date" | "check_out_date";
  label: string;
  control: Control<ReservationFormValues>;
  error?: string;
  disabled?: boolean;
}

export function DateField({
  name,
  label,
  control,
  error,
  disabled,
}: DateFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            type="date"
            value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
            onChange={(e) => field.onChange(e.target.valueAsDate ?? undefined)}
            disabled={disabled}
          />
        )}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
