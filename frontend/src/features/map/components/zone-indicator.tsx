import { useEffect, useRef, useState } from "react";

import { ZoneId } from "@/features/map/constants";
import { useLanded } from "@/features/airport/hooks/use-airport";
import { useCheckedIn } from "@/features/beach/hooks/use-checked-in";
import { useZoneActivityTick } from "@/features/map/hooks/use-zone-activity-tick";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/stores/session-selectors";

interface ZoneIndicatorProps {
  id: ZoneId;
  x: number;
  y: number;
  radius: number;
  label: string;
  accent: string;
  markerSrc: string;
  markerScale?: number;
  healthLevel?: number;
  eventRate?: number;
  onClick?: (id: ZoneId) => void;
}

const MARKER_ACTIVITY_MS = 820;

export function ZoneIndicator({
  id,
  x,
  y,
  radius,
  label,
  accent,
  markerSrc,
  markerScale = 1,
  onClick,
}: ZoneIndicatorProps) {
  const isAdmin = useIsAdmin();
  const landed = useLanded();
  const checkedIn = useCheckedIn();
  const activityTick = useZoneActivityTick(id);

  const [isActive, setIsActive] = useState(false);
  const previousTickRef = useRef(activityTick);

  const needsLanding = id !== ZoneId.Airport;
  const needsCheckin = id === ZoneId.Beach;
  const isLockedForGuest =
    (needsLanding && !landed) || (needsCheckin && !checkedIn);
  const locked = !isAdmin && isLockedForGuest;

  useEffect(() => {
    if (activityTick === 0 || activityTick === previousTickRef.current) {
      previousTickRef.current = activityTick;
      return;
    }

    previousTickRef.current = activityTick;
    setIsActive(true);

    const timer = window.setTimeout(() => {
      setIsActive(false);
    }, MARKER_ACTIVITY_MS);

    return () => window.clearTimeout(timer);
  }, [activityTick]);

  return (
    <div
      role="button"
      aria-label={label}
      data-testid={`zone-indicator-${id}`}
      data-locked={locked}
      onClick={() => onClick?.(id)}
      className="pointer-events-auto absolute flex cursor-pointer items-center justify-center"
      style={{
        left: x - radius,
        top: y - radius,
        width: radius * 2,
        height: radius * 2,
      }}
    >
      <div
        className="pointer-events-none flex h-full w-full items-center justify-center overflow-visible"
        style={{ transform: `scale(${markerScale})` }}
      >
        <img
          src={markerSrc}
          alt=""
          aria-hidden="true"
          className={cn(
            "zone-marker-asset h-full w-full object-contain select-none",
            locked && "is-locked",
            isActive && "is-active"
          )}
          draggable={false}
          style={{ "--zone-accent": accent } as React.CSSProperties}
        />
      </div>
    </div>
  );
}
