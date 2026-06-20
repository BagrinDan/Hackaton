import type { Icon } from "@tabler/icons-react";
import {
  IconPlaneDeparture,
  IconBed,
  IconUmbrella,
  IconFeather,
  IconBuildingLighthouse,
} from "@tabler/icons-react";
import airportZoneArt from "@/assets/zones/airport.svg";
import beachZoneArt from "@/assets/zones/beach.svg";
import hotelZoneArt from "@/assets/zones/hotel.svg";
import lighthouseZoneArt from "@/assets/zones/lighthouse.svg";
import parrotZoneArt from "@/assets/zones/parrot.svg";
import { ZoneId } from "@/features/map/constants";
import { ChannelId } from "@/types/broadcast";

export interface ZoneDefinition {
  id: ZoneId;
  label: string;
  description: string;
  adminDescription: string;
  icon: Icon;
  channel: ChannelId;
  position: {
    x: number;
    y: number;
  };
  accent: string;
  markerSrc: string;
  markerScale?: number;
}

export const ZONE_REGISTRY: Record<ZoneId, ZoneDefinition> = {
  [ZoneId.Airport]: {
    id: ZoneId.Airport,
    label: "Airport",
    description:
      "Join the departure queue and clear passport control. You can't check in anywhere until you've landed.",
    adminDescription:
      "Observe airport arrivals, queue movement, and passport-control events.",
    icon: IconPlaneDeparture,
    channel: ChannelId.Airport,
    position: { x: 1600, y: 320 },
    accent: "#38bdf8",
    markerSrc: airportZoneArt,
    markerScale: 2,
  },
  [ZoneId.Hotel]: {
    id: ZoneId.Hotel,
    label: "Hotel",
    description:
      "Reserve a room for your stay. The hotel checks you've cleared the airport first.",
    adminDescription:
      "Observe hotel room, reservation, and cancellation events.",
    icon: IconBed,
    channel: ChannelId.Hotel,
    position: { x: 1720, y: 900 },
    markerSrc: hotelZoneArt,
    accent: "#34d399",
    markerScale: 1.65,
  },
  [ZoneId.Beach]: {
    id: ZoneId.Beach,
    label: "Beach",
    description:
      "Browse activities and grab a spot. Each has limited capacity and guests can only join one at a time.",
    adminDescription:
      "Observe beach activity capacity, booking, and cancellation events.",
    icon: IconUmbrella,
    channel: ChannelId.Hotel,
    position: { x: 580, y: 1400 },
    accent: "#fbbf24",
    markerSrc: beachZoneArt,
    markerScale: 1,
  },
  [ZoneId.Parrot]: {
    id: ZoneId.Parrot,
    label: "Parrot",
    description:
      "Chat with the resort's AI parrot for island guidance, recommendations, and quick answers.",
    adminDescription:
      "Observe the AI parrot's activity: chat volume, tool usage, and conversation transcripts.",
    icon: IconFeather,
    channel: ChannelId.Parrot,
    position: { x: 2380, y: 1560 },
    accent: "#a78bfa",
    markerSrc: parrotZoneArt,
    markerScale: 1,
  },
  [ZoneId.Broadcast]: {
    id: ZoneId.Broadcast,
    label: "Lighhouse",
    description: "Resort-wide announcements broadcast to every guest on the island.",
    adminDescription:
      "Observe the full island-wide event stream from every service.",
    icon: IconBuildingLighthouse,
    channel: ChannelId.ResortWide,
    position: { x: 375, y: 890 },
    accent: "#22d3ee",
    markerSrc: lighthouseZoneArt,
    markerScale: 2,
  },
};

export function getZone(id: ZoneId) {
  return ZONE_REGISTRY[id];
}
