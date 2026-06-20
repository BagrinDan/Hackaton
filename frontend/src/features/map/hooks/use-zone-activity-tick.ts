import { getZone } from "@/features/map/zone-registry";
import { ZoneId } from "@/features/map/constants";
import { useEventsStore } from "@/stores/events-store";

export function useZoneActivityTick(zoneId: ZoneId): number {
  const { channel } = getZone(zoneId);

  return useEventsStore((state) => state.activityTick[channel]);
}
