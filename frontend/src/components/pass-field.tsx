import type { Icon } from "@tabler/icons-react";

export function PassField({
  icon: FieldIcon,
  label,
  value,
}: {
  icon: Icon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
        <FieldIcon size={10} />
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
