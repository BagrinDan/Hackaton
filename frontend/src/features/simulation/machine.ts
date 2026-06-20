import {
  arrive,
  askParrot,
  bookHotel,
  bookRandomActivity,
  cancelBeachActivity,
  cancelHotelReservation,
  sample,
} from "@/features/simulation/actions";
import { syntheticGuests } from "@/features/simulation/data/synthetic-guests";
import type { GuestProfile } from "@/types/guest";

export const STAGES = [
  "new",
  "arrived",
  "hotel_booked",
  "beach_booked",
] as const;
export type SimGuestStage = (typeof STAGES)[number];

export type SimGuestState =
  | { stage: "new" }
  | { stage: "arrived"; gate: string }
  | { stage: "hotel_booked"; gate: string; reservationId: string }
  | {
      stage: "beach_booked";
      gate: string;
      reservationId: string;
      activityId: string;
    };

export type GuestStates = Record<string, SimGuestState>;

type StepContext = {
  guest: GuestProfile;
  state: SimGuestState;
  setState: (state: SimGuestState) => void;
};

function roll(chance: number): boolean {
  return Math.random() < chance;
}

async function handleNew({ guest, setState }: StepContext) {
  const gate = await arrive(guest);
  if (gate) {
    setState({ stage: "arrived", gate });
  }
}

async function handleArrived({ guest, state, setState }: StepContext) {
  if (state.stage !== "arrived") return;

  if (roll(0.8)) {
    const reservationId = await bookHotel(guest);

    if (reservationId) {
      setState({ stage: "hotel_booked", gate: state.gate, reservationId });
    }

    return;
  }

  await askParrot(guest);
}

async function handleHotelBooked({ guest, state, setState }: StepContext) {
  if (state.stage !== "hotel_booked") return;

  const action = Math.random();
  if (action < 0.25) {
    const activityId = await bookRandomActivity(guest);

    if (activityId) {
      setState({
        stage: "beach_booked",
        gate: state.gate,
        reservationId: state.reservationId,
        activityId,
      });
    }

    return;
  }

  if (action < 0.65) {
    await askParrot(guest);
  }
}

async function handleBeachBooked({ guest, state, setState }: StepContext) {
  if (state.stage !== "beach_booked") return;

  const action = Math.random();

  if (action < 0.1) {
    await cancelBeachActivity(state.activityId, guest);
    await cancelHotelReservation(state.reservationId);
    setState({ stage: "new" });
    return;
  }

  if (action < 0.25) {
    await cancelBeachActivity(state.activityId, guest);
    setState({
      stage: "hotel_booked",
      gate: state.gate,
      reservationId: state.reservationId,
    });
    return;
  }

  if (action < 0.45) {
    await askParrot(guest);
  }
}

const STAGE_HANDLERS: Record<
  SimGuestStage,
  (ctx: StepContext) => Promise<void>
> = {
  new: handleNew,
  arrived: handleArrived,
  hotel_booked: handleHotelBooked,
  beach_booked: handleBeachBooked,
};

function seedState(stage: SimGuestStage): SimGuestState {
  switch (stage) {
    case "new":
      return { stage };
    case "arrived":
      return { stage, gate: "" };
    case "hotel_booked":
    case "beach_booked":
      return { stage: "hotel_booked", gate: "", reservationId: "" };
  }
}

export function createInitialState(): GuestStates {
  return Object.fromEntries(
    syntheticGuests.map((guest, i) => [
      guest.id,
      seedState(STAGES[i % STAGES.length]!),
    ])
  );
}

export async function runGuestStep(states: GuestStates): Promise<void> {
  const guest = sample(syntheticGuests);
  const state = states[guest.id];
  await STAGE_HANDLERS[state.stage]({
    guest,
    state,
    setState: (next) => {
      states[guest.id] = next;
    },
  });
}
