import { useEffect, useRef } from "react";

import { env } from "@/config/env";
import { randomInt } from "@/features/simulation/actions";
import {
  createInitialState,
  runGuestStep,
} from "@/features/simulation/machine";
import type { GuestStates } from "@/features/simulation/machine";

const GENERATOR_ENABLED = env.trafficGeneratorEnabled;
const MIN_DELAY_MS = 1_500;
const MAX_DELAY_MS = 4_000;
const CONCURRENT_GUESTS = 3;

export function useTrafficGenerator() {
  const ticksRef = useRef<number[]>([]);
  const runningRef = useRef(false);
  const guestStatesRef = useRef<GuestStates>(createInitialState());

  useEffect(() => {
    if (!GENERATOR_ENABLED) return;

    runningRef.current = true;

    const scheduleNext = () => {
      if (!runningRef.current) return;

      const id = window.setTimeout(
        async () => {
          try {
            await runGuestStep(guestStatesRef.current);
          } catch (error) {
            console.debug("[traffic-generator] request failed", error);
          } finally {
            scheduleNext();
          }
        },
        randomInt(MIN_DELAY_MS, MAX_DELAY_MS)
      );
      ticksRef.current.push(id);
    };

    for (let i = 0; i < CONCURRENT_GUESTS; i++) {
      scheduleNext();
    }

    return () => {
      runningRef.current = false;
      ticksRef.current.forEach(window.clearTimeout);
      ticksRef.current = [];
    };
  }, []);

  return { running: GENERATOR_ENABLED };
}
