import { format, formatDistanceToNow } from "date-fns";

export function formatTime(iso: string): string {
  return format(new Date(iso), "HH:mm:ss");
}

export function formatRelativeFromEpoch(epochSeconds: number): string {
  return formatDistanceToNow(new Date(epochSeconds * 1000), {
    addSuffix: true,
  });
}

export function formatRoomType(roomType: string): string {
  return roomType
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}
