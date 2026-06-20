import { ZonePanelShell } from "@/features/map/components/zone-panel-shell";
import { AirportPanel } from "@/features/airport/components/airport-panel";
import { HotelPanel } from "@/features/hotel/components/hotel-panel";
import { BeachPanel } from "@/features/beach/components/beach-panel";
import { ParrotPanel } from "@/features/parrot/components/parrot-panel";
import { BroadcastPanel } from "@/features/broadcast/components/broadcast-panel";
import { ZoneId } from "@/features/map/constants";

interface ZonePanelProps {
  zoneId: ZoneId | null;
  open: boolean;
  onClose: () => void;
}

function ZonePanelContent({ zoneId }: { zoneId: ZoneId }) {
  switch (zoneId) {
    case ZoneId.Airport:
      return <AirportPanel />;
    case ZoneId.Hotel:
      return <HotelPanel />;
    case ZoneId.Beach:
      return <BeachPanel />;
    case ZoneId.Parrot:
      return <ParrotPanel />;
    case ZoneId.Broadcast:
      return <BroadcastPanel />;
  }
}

export function ZonePanel({ zoneId, open, onClose }: ZonePanelProps) {
  return (
    <ZonePanelShell zoneId={zoneId} open={open} onClose={onClose}>
      {zoneId && <ZonePanelContent zoneId={zoneId} />}
    </ZonePanelShell>
  );
}
