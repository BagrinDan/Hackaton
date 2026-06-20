import { z } from "zod";
import { PostArrivalRequestSchema } from "@/features/airport/types";
import type { GuestProfile } from "@/types/guest";

export const ArrivalFormSchema = PostArrivalRequestSchema;

export type ArrivalFormValues = z.infer<typeof ArrivalFormSchema>;

export function guestToArrivalForm(guest: GuestProfile): ArrivalFormValues {
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
