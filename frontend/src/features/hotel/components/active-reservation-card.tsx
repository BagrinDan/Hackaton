import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconLoader2, IconX } from "@tabler/icons-react";
import type { Reservation } from "@/features/hotel/types";
import { ReservationCard } from "./reservation-card";
import { ReservationFields } from "./reservation-fields";
import { formatRoomType } from "@/lib/format";

interface ActiveReservationCardProps {
  reservation: Reservation;
  onCancel: () => void;
  isCancelling: boolean;
}

export function ActiveReservationCard({
  reservation,
  onCancel,
  isCancelling,
}: ActiveReservationCardProps) {
  return (
    <div data-testid="active-reservation">
      <ReservationCard
        headerLabel="Room Reservation"
        headerBadge={
          <Badge className="rounded-full border-0 bg-white/20 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-white uppercase">
            Confirmed
          </Badge>
        }
        title={reservation.room_id}
        subtitle={`${formatRoomType(reservation.room_type)} room`}
        footer={
          <Button
            variant="destructive"
            onClick={onCancel}
            disabled={isCancelling}
            className="w-full"
          >
            {isCancelling ? (
              <>
                <IconLoader2 size={14} className="mr-2 animate-spin" />
                Cancelling…
              </>
            ) : (
              <>
                <IconX size={14} className="mr-2" />
                Cancel reservation
              </>
            )}
          </Button>
        }
      >
        <ReservationFields reservation={reservation} />
      </ReservationCard>
    </div>
  );
}
