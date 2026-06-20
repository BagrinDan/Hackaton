import guestsJson from "./guests.json";
import type { GuestProfile } from "@/types/guest";

export const guests = guestsJson as GuestProfile[];

export type { GuestProfile };
