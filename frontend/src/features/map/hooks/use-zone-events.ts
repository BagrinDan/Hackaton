import { useEventsStore } from "@/stores/events-store";
import { getZone } from "@/features/map/zone-registry";
import { ZoneId } from "@/features/map/constants";
import type { BroadcastEvent } from "@/types/broadcast";

export function useZoneEvents(zoneId: ZoneId): BroadcastEvent[] {
  const { channel } = getZone(zoneId);
  return useEventsStore((s) => s.events[channel]);
}
