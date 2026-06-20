import { format } from "date-fns";
import { IconCalendar, IconUsers, IconBed } from "@tabler/icons-react";
import type { Reservation } from "@/features/hotel/types";
import { simulationDayToDate } from "@/lib/simulation-time";
import { PassField } from "@/components/pass-field";
import { formatRoomType } from "@/lib/format";

export function ReservationFields({
  reservation,
}: {
  reservation: Reservation;
}) {
  const { room_type, check_in_day, check_out_day, guest_count } = reservation;
  return (
    <>
      <PassField
        icon={IconCalendar}
        label="Check-in"
        value={format(simulationDayToDate(check_in_day), "MMM d, yyyy")}
      />
      <PassField
        icon={IconCalendar}
        label="Check-out"
        value={format(simulationDayToDate(check_out_day), "MMM d, yyyy")}
      />
      <PassField
        icon={IconBed}
        label="Room type"
        value={formatRoomType(room_type)}
      />
      <PassField
        icon={IconUsers}
        label="Guests"
        value={`${guest_count} guest${guest_count !== 1 ? "s" : ""}`}
      />
    </>
  );
}
