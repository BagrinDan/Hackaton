import { postArrival } from "@/features/airport/api/airport-client";
import {
  bookActivity,
  cancelActivity,
  getActivities,
} from "@/features/beach/api/beach-client";
import {
  cancelReservation,
  getReservationByGuest,
  postReservation,
} from "@/features/hotel/api/hotel-client";
import { env } from "@/config/env";
import { ROOM_MAX_GUESTS, ROOM_TYPES } from "@/features/hotel/types";
import { postChat } from "@/features/parrot/api/parrot-client";
import { getCurrentSimulationDay } from "@/lib/simulation-time";
import type { GuestProfile } from "@/types/guest";

const PARROT_QUESTIONS = [
  "What should I do first on the island?",
  "Can you suggest a beach activity?",
  "What should I know before checking in?",
  "What is the resort like this afternoon?",
];

let lastParrotChatAt = 0;

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function sample<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function guestToArrivalBody(guest: GuestProfile) {
  return {
    guest_id: guest.id,
    name: guest.name,
    surname: guest.surname,
    age: guest.age,
    passport_type: guest.passport,
    priority: guest.priority,
    disability: guest.disability,
  };
}

function randomReservationBody(guest: GuestProfile) {
  const today = Math.max(0, getCurrentSimulationDay());
  const checkIn = today + randomInt(0, 2);
  const roomType = sample(ROOM_TYPES);
  return {
    guest_id: guest.id,
    room_type: roomType,
    guest_count: randomInt(1, ROOM_MAX_GUESTS[roomType]),
    check_in_day: checkIn,
    check_out_day: checkIn + randomInt(1, 3),
  };
}

export async function arrive(guest: GuestProfile): Promise<string | null> {
  try {
    const result = await postArrival(guestToArrivalBody(guest));
    return result.gate;
  } catch {
    return null;
  }
}

export async function askParrot(guest: GuestProfile): Promise<void> {
  const now = Date.now();
  if (now - lastParrotChatAt < env.parrotChatCooldownMs) {
    return;
  }
  lastParrotChatAt = now;

  try {
    await postChat({ guest_id: guest.id, message: sample(PARROT_QUESTIONS) });
  } catch {
    // best-effort simulation traffic
  }
}

export async function bookHotel(guest: GuestProfile): Promise<string | null> {
  try {
    const result = await postReservation(randomReservationBody(guest));
    return result.id;
  } catch {
    // stale sessionStorage reservation, recover the existing id
    try {
      const existing = await getReservationByGuest(guest.id);
      return existing.id;
    } catch {
      return null;
    }
  }
}

export async function bookRandomActivity(
  guest: GuestProfile
): Promise<string | null> {
  try {
    const activities = await getActivities();
    const available = activities.activities.filter((a) => a.remaining > 0);
    if (available.length === 0) return null;

    const activity = sample(available);
    await bookActivity(activity.activity_id, guest.id);

    return activity.activity_id;
  } catch {
    return null;
  }
}

export async function cancelBeachActivity(
  activityId: string,
  guest: GuestProfile
): Promise<void> {
  try {
    await cancelActivity(activityId, guest.id);
  } catch {
    // best-effort simulation traffic
  }
}

export async function cancelHotelReservation(
  reservationId: string
): Promise<void> {
  try {
    await cancelReservation(reservationId);
  } catch {
    // best-effort simulation traffic
  }
}
