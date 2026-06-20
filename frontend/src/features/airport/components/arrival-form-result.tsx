import { Badge } from "@/components/ui/badge";
import type { PostArrivalResponse } from "@/features/airport/types";

interface ArrivalFormResultProps {
  result: PostArrivalResponse;
}

export function ArrivalFormResult({ result }: ArrivalFormResultProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-background/80 px-4 py-3">
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="border-(--zone-accent) text-(--zone-accent)"
        >
          Queued
        </Badge>
        <span className="text-xs text-muted-foreground">Gate {result.gate}</span>
      </div>
      <p className="text-sm font-medium text-foreground">
        Position <span className="text-(--zone-accent)">#{result.position}</span>{" "}
        of {result.queue_size}
      </p>
    </div>
  );
}
