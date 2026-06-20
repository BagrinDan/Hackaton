import { NotLandedGate } from "@/features/map/components/not-landed-gate";
import { ZoneEventLog } from "@/features/map/components/zone-event-log";
import { ZoneId } from "@/features/map/constants";
import { useZoneEvents } from "@/features/map/hooks/use-zone-events";
import { NotCheckedInGate } from "@/features/beach/components/not-checked-in-gate";
import { useLanded } from "@/features/airport/hooks/use-airport";
import { useCheckedIn } from "@/features/beach/hooks/use-checked-in";
import { ActivitiesList } from "@/features/beach/components/activities-list";
import { BeachAdminActivitiesSummary } from "@/features/beach/components/beach-admin-activities-summary";
import { useIsAdmin } from "@/stores/session-selectors";

export function BeachPanel() {
  const isAdmin = useIsAdmin();
  const events = useZoneEvents(ZoneId.Beach);
  const landed = useLanded();
  const checkedIn = useCheckedIn();

  if (isAdmin) {
    return (
      <>
        <BeachAdminActivitiesSummary />
        <ZoneEventLog events={events} />
      </>
    );
  }

  return (
    <>
      {!landed ? (
        <NotLandedGate />
      ) : !checkedIn ? (
        <NotCheckedInGate />
      ) : (
        <div className="flex flex-col gap-3">
          <ActivitiesList />
        </div>
      )}
    </>
  );
}
