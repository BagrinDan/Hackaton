import { Badge } from "@/components/ui/badge";
import type { Reservation } from "@/features/hotel/types";
import { ReservationCard } from "./reservation-card";
import { ReservationFields } from "./reservation-fields";
import { formatRoomType } from "@/lib/format";

interface ReservationResultProps {
  reservation: Reservation;
}

export function ReservationResult({ reservation }: ReservationResultProps) {
  return (
    <div data-testid="reservation-confirmed">
      <ReservationCard
        headerLabel="Booking Confirmed"
      headerBadge={
        <Badge className="rounded-full border-0 bg-white/20 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-white uppercase">
          {formatRoomType(reservation.room_type)}
        </Badge>
      }
      title={reservation.room_id}
      subtitle="Resort guest · confirmed"
    >
        <ReservationFields reservation={reservation} />
      </ReservationCard>
    </div>
  );
}
