import { IconMinus, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface GuestStepperProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function GuestStepper({ value, onChange, disabled }: GuestStepperProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
        className="rounded-full bg-transparent"
      >
        <IconMinus size={14} />
      </Button>
      <span className="w-6 text-center text-sm font-semibold tabular-nums">
        {value}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={disabled}
        onClick={() => onChange(value + 1)}
        className="rounded-full bg-transparent"
      >
        <IconPlus size={14} />
      </Button>
      <span className="text-xs text-muted-foreground">
        {value === 1 ? "guest" : "guests"}
      </span>
    </div>
  );
}
