import { guests } from "@/data/guests";
import { syntheticGuests } from "@/features/simulation/data/synthetic-guests";
import type { GuestProfile } from "@/types/guest";

const guestsById = new Map<string, GuestProfile>(
  [...guests, ...syntheticGuests].map((guest) => [guest.id, guest])
);

export function getInitials(guest: GuestProfile | null | undefined): string {
  return `${guest?.name[0] ?? ""}${guest?.surname[0] ?? ""}`;
}

export function findGuestName(guestId: string | undefined): string | undefined {
  if (!guestId) return undefined;
  const guest = guestsById.get(guestId);
  return guest ? `${guest.name} ${guest.surname}` : undefined;
}

export function resolveGuestName(guestId: string): string {
  return findGuestName(guestId) ?? guestId;
}
