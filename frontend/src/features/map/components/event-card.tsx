import { findGuestName } from "@/lib/guest";
import type { BroadcastEvent } from "@/types/broadcast";

interface EventCardProps {
  event: BroadcastEvent;
}

export function EventCard({ event }: EventCardProps) {
  const guestName = event.guest_name ?? findGuestName(event.guest_id);

  return (
    <div
      data-testid="event-card"
      data-channel={event.channel}
      data-event-type={event.event_type}
      className="animate-in slide-in-from-top-2 flex flex-col gap-2 rounded-md border border-dashed border-border bg-accent/30 px-4 py-3 text-sm duration-200"
    >
      <p className="leading-6 text-foreground">{event.message}</p>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        {guestName && (
          <span className="truncate font-medium text-(--zone-accent)">
            {guestName}
          </span>
        )}
        <span className="ml-auto truncate capitalize">{event.sender}</span>
      </div>
    </div>
  );
}
