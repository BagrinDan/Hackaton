import { useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import islandBg from "@/assets/island-bg.svg";
import oceanBg from "@/assets/ocean-bg.svg";
import { ConnectionStatus } from "@/features/broadcast/components/connection-status";
import { GuestHud } from "@/features/map/components/guest-hud";
import { IslandTitle } from "@/features/map/components/island-title";
import { KikiCompanion } from "@/features/map/components/kiki-companion";
import { KikiWardrobeButton } from "@/features/map/components/kiki-wardrobe";
import { ZoneLayer } from "@/features/map/components/zone-layer";
import { ZonePanel } from "@/features/map/components/zone-panel";
import { ZoneId } from "@/features/map/constants";
import { useBroadcast } from "@/features/broadcast/hooks/use-broadcast";
import { useMapDimensions } from "@/features/map/hooks/use-map-dimensions";
import { useTrafficGenerator } from "@/features/simulation/hooks/use-traffic-generator";

export function MapPage() {
  const { w, h, minScale } = useMapDimensions();

  const [activeZone, setActiveZone] = useState<ZoneId | null>(null);

  const { status } = useBroadcast();
  useTrafficGenerator();

  const panelOpen = activeZone !== null;

  return (
    <div className="fixed inset-0 overflow-hidden">
      <img
        src={oceanBg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0">
        <TransformWrapper
          initialScale={minScale}
          minScale={minScale * 0.5}
          maxScale={3}
          limitToBounds={false}
          centerOnInit
          wheel={{ step: 0.001 }}
        >
          <TransformComponent
            wrapperClass="!w-full !h-full"
            contentClass="cursor-grab active:cursor-grabbing"
          >
            <div className="relative" style={{ width: w, height: h }}>
              <img
                src={islandBg}
                width={w}
                height={h}
                alt="Island map"
                draggable={false}
                className="block select-none"
              />
              <ZoneLayer mapW={w} mapH={h} onZoneClick={setActiveZone} />
            </div>
          </TransformComponent>
        </TransformWrapper>

        <GuestHud />
      </div>

      <IslandTitle />

      <KikiWardrobeButton />

      <KikiCompanion />

      <ConnectionStatus status={status} />

      <ZonePanel
        zoneId={activeZone}
        open={panelOpen}
        onClose={() => setActiveZone(null)}
      />
    </div>
  );
}
