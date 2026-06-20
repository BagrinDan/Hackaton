import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { ZoneEventLog } from "@/features/map/components/zone-event-log";
import { ZoneId } from "@/features/map/constants";
import { useZoneEvents } from "@/features/map/hooks/use-zone-events";
import { useGuest, useIsAdmin } from "@/stores/session-selectors";
import { NotLandedGate } from "@/features/map/components/not-landed-gate";
import { useLanded } from "@/features/airport/hooks/use-airport";
import { useReservationForm } from "@/features/hotel/hooks/use-reservation-form";
import { useActiveReservation } from "@/features/hotel/hooks/use-active-reservation";
import { ReservationForm } from "@/features/hotel/components/reservation-form";
import { ReservationResult } from "@/features/hotel/components/reservation-result";
import { ActiveReservationCard } from "@/features/hotel/components/active-reservation-card";
import { HotelAdminRoomSummary } from "@/features/hotel/components/hotel-admin-room-summary";

export function HotelPanel() {
  const isAdmin = useIsAdmin();
  const guest = useGuest();
  const events = useZoneEvents(ZoneId.Hotel);
  const landed = useLanded();

  const { reservation, isLoading, cancel, isCancelling } =
    useActiveReservation();
  const { form, onSubmit, confirmed, resetConfirmed, isSubmitting } =
    useReservationForm();

  if (isAdmin) {
    return (
      <>
        <HotelAdminRoomSummary />
        <ZoneEventLog events={events} />
      </>
    );
  }

  if (!guest) return null;

  return (
    <>
      {!landed ? (
        <NotLandedGate />
      ) : isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner className="size-6" />
        </div>
      ) : reservation ? (
        <ActiveReservationCard
          reservation={reservation}
          onCancel={() => {
            cancel(reservation.id);
            resetConfirmed();
          }}
          isCancelling={isCancelling}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <ReservationForm
            form={form}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
          {confirmed && (
            <>
              <Separator />
              <ReservationResult reservation={confirmed} />
            </>
          )}
        </div>
      )}
    </>
  );
}
