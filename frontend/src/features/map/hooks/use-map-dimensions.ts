import { useEffect, useState } from "react";
import { MAP_ASPECT, MAP_ZOOM_BUDGET } from "@/features/map/constants";

interface MapDimensions {
  w: number;
  h: number;
  minScale: number;
}

function compute(vpW: number, vpH: number): MapDimensions {
  // Rendered map is viewport × zoom budget
  const byWidth = vpW * MAP_ZOOM_BUDGET;
  const byHeight = vpH * MAP_ZOOM_BUDGET * MAP_ASPECT;
  const w = Math.max(byWidth, byHeight);
  const h = w / MAP_ASPECT;
  return { w, h, minScale: Math.max(vpW / w, vpH / h) };
}

export function useMapDimensions(): MapDimensions {
  const [dims, setDims] = useState<MapDimensions>(() =>
    compute(window.innerWidth, window.innerHeight)
  );

  useEffect(() => {
    const update = () =>
      setDims(compute(window.innerWidth, window.innerHeight));
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return dims;
}
