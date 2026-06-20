import { IconChevronDown } from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { EventLog } from "@/features/map/components/event-log";
import type { BroadcastEvent } from "@/types/broadcast";

interface ZoneEventLogProps {
  events: BroadcastEvent[];
  limit?: number;
}

export function ZoneEventLog({ events, limit = 25 }: ZoneEventLogProps) {
  return (
    <Collapsible defaultOpen={true}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <span>Recent events</span>
        <IconChevronDown
          size={14}
          className="ml-auto transition-transform [[data-state=open]_&]:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3">
        <EventLog events={events} limit={limit} />
      </CollapsibleContent>
    </Collapsible>
  );
}
