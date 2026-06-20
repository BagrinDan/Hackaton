import { z } from "zod";
import {
  RoomTypeSchema,
  type PostReservationRequest,
} from "@/features/hotel/types";
import { dateToSimulationDay } from "@/lib/simulation-time";

export const ReservationFormSchema = z
  .object({
    room_type: RoomTypeSchema,
    guest_count: z.number().int().min(1),
    check_in_date: z.date(),
    check_out_date: z.date(),
  })
  .refine((data) => data.check_out_date > data.check_in_date, {
    message: "Check-out must be after check-in",
    path: ["check_out_date"],
  });

export type ReservationFormValues = z.infer<typeof ReservationFormSchema>;

export function formToRequest(
  values: ReservationFormValues,
  guestId: string
): PostReservationRequest {
  return {
    guest_id: guestId,
    room_type: values.room_type,
    guest_count: values.guest_count,
    check_in_day: dateToSimulationDay(values.check_in_date),
    check_out_day: dateToSimulationDay(values.check_out_date),
  };
}
