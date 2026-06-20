import { IconFeather } from "@tabler/icons-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ParrotAvatarProps {
  variant?: "default" | "error";
}

export function ParrotAvatar({ variant = "default" }: ParrotAvatarProps) {
  const isError = variant === "error";
  return (
    <Avatar
      size="sm"
      className={cn(
        "mt-1",
        isError ? "bg-destructive/10" : "bg-(--zone-accent)/15"
      )}
    >
      <AvatarFallback
        className={cn(
          isError
            ? "bg-destructive/10 text-destructive"
            : "bg-(--zone-accent)/15 text-(--zone-accent)"
        )}
      >
        <IconFeather size={14} stroke={2} />
      </AvatarFallback>
    </Avatar>
  );
}
