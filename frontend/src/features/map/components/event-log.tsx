import { EventCard } from "@/features/map/components/event-card";
import type { BroadcastEvent } from "@/types/broadcast";

interface EventLogProps {
  events: BroadcastEvent[];
  limit?: number;
}

export function EventLog({ events, limit }: EventLogProps) {
  const visible = limit ? events.slice(0, limit) : events;

  if (visible.length === 0) {
    return (
      <p
        data-testid="event-log-empty"
        className="py-4 text-center text-xs text-muted-foreground"
      >
        No events yet.
      </p>
    );
  }

  return (
    <div data-testid="event-log" className="flex flex-col gap-2">
      {visible.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
