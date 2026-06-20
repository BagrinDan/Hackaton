import { create } from "zustand";

import { ChannelId } from "@/types/broadcast";
import type { BroadcastEvent } from "@/types/broadcast";

const MAX_EVENTS = 100;

interface IngestEventOptions {
  mirrorToResortWide?: boolean;
}

interface EventsState {
  events: Record<ChannelId, BroadcastEvent[]>;
  activityTick: Record<ChannelId, number>;
  ingestEvent: (event: BroadcastEvent, options?: IngestEventOptions) => void;
  clearEvents: (channel: ChannelId) => void;
}

function createEmptyChannelEvents(): Record<ChannelId, BroadcastEvent[]> {
  return {
    [ChannelId.Airport]: [],
    [ChannelId.Hotel]: [],
    [ChannelId.Beach]: [],
    [ChannelId.Parrot]: [],
    [ChannelId.Broadcast]: [],
    [ChannelId.ResortWide]: [],
  };
}

function createEmptyActivityTicks(): Record<ChannelId, number> {
  return {
    [ChannelId.Airport]: 0,
    [ChannelId.Hotel]: 0,
    [ChannelId.Beach]: 0,
    [ChannelId.Parrot]: 0,
    [ChannelId.Broadcast]: 0,
    [ChannelId.ResortWide]: 0,
  };
}

function prependEvent(events: BroadcastEvent[], event: BroadcastEvent) {
  const next = [event, ...events];

  if (next.length > MAX_EVENTS) {
    next.length = MAX_EVENTS;
  }

  return next;
}

export const useEventsStore = create<EventsState>()((set) => ({
  events: createEmptyChannelEvents(),
  activityTick: createEmptyActivityTicks(),

  ingestEvent: (event, options) =>
    set((state) => {
      const nextEvents = {
        ...state.events,
        [event.channel]: prependEvent(state.events[event.channel], event),
      };

      const nextActivityTick = {
        ...state.activityTick,
        [event.channel]: state.activityTick[event.channel] + 1,
      };

      const shouldMirrorToResortWide =
        options?.mirrorToResortWide && event.channel !== ChannelId.ResortWide;
      if (shouldMirrorToResortWide) {
        const mirroredEvent: BroadcastEvent = {
          ...event,
          id: crypto.randomUUID(),
          channel: ChannelId.ResortWide,
        };

        nextEvents[ChannelId.ResortWide] = prependEvent(
          state.events[ChannelId.ResortWide],
          mirroredEvent
        );
        nextActivityTick[ChannelId.ResortWide] =
          state.activityTick[ChannelId.ResortWide] + 1;
      }

      return {
        events: nextEvents,
        activityTick: nextActivityTick,
      };
    }),

  clearEvents: (channel) =>
    set((state) => ({
      events: { ...state.events, [channel]: [] },
    })),
}));
