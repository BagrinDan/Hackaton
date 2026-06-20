import { http, HttpResponse } from "msw";
import { env } from "@/config/env";
import type { Activity } from "@/features/beach/types";

const GATEWAY_URL = env.gatewayUrl;
const ACTIVITIES_KEY = "msw-activities";
const BOOKINGS_KEY = "msw-activity-bookings";

const SEED: Activity[] = [
  {
    activity_id: "activity-sunset-cruise",
    activity_name: "Sunset Cruise",
    description:
      "Sail along the coast and watch the sun dip below the horizon.",
    capacity: 10,
    remaining: 2,
  },
  {
    activity_id: "activity-snorkeling",
    activity_name: "Snorkeling",
    description: "Explore the coral reef with our guided snorkeling tour.",
    capacity: 8,
    remaining: 0,
  },
  {
    activity_id: "activity-glass-bottom-boat",
    activity_name: "Glass-Bottom Boat",
    description: "See the underwater world without getting wet.",
    capacity: 12,
    remaining: 3,
  },
  {
    activity_id: "activity-beach-volleyball",
    activity_name: "Beach Volleyball",
    description: "Join a casual game on the main beach court.",
    capacity: 20,
    remaining: 14,
  },
  {
    activity_id: "activity-kayaking",
    activity_name: "Kayaking",
    description: "Paddle through the lagoon at your own pace.",
    capacity: 6,
    remaining: 4,
  },
  {
    activity_id: "activity-beach-yoga",
    activity_name: "Beach Yoga",
    description: "Morning yoga session on the shoreline.",
    capacity: 15,
    remaining: 11,
  },
];

function loadActivities(): Activity[] {
  try {
    const stored = sessionStorage.getItem(ACTIVITIES_KEY);
    if (stored) return JSON.parse(stored) as Activity[];
  } catch {
    // empty
  }

  sessionStorage.setItem(ACTIVITIES_KEY, JSON.stringify(SEED));
  return SEED;
}

function saveActivities(activities: Activity[]) {
  sessionStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
}

function loadBookings(): Record<string, string | null> {
  try {
    const stored = sessionStorage.getItem(BOOKINGS_KEY);
    if (!stored) return {};

    const parsed = JSON.parse(stored) as Record<
      string,
      string | string[] | null
    >;

    return Object.fromEntries(
      Object.entries(parsed).map(([guestId, value]) => [
        guestId,
        Array.isArray(value) ? (value.at(-1) ?? null) : value,
      ])
    );
  } catch {
    return {};
  }
}

function saveBookings(bookings: Record<string, string | null>) {
  sessionStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

export const beachHandlers = [
  http.get(`${GATEWAY_URL}/activities`, () => {
    return HttpResponse.json({ activities: loadActivities() });
  }),

  http.get(`${GATEWAY_URL}/activity/:activityId`, ({ params }) => {
    const activities = loadActivities();
    const activity = activities.find(
      (a) => a.activity_id === String(params["activityId"])
    );
    if (!activity) {
      return HttpResponse.json(
        { message: "Activity not found" },
        { status: 404 }
      );
    }
    return HttpResponse.json(activity);
  }),

  http.post(
    `${GATEWAY_URL}/activity/book/:activityId`,
    async ({ params, request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      const guestId = String(body["id"]);
      const activityId = String(params["activityId"]);

      const activities = loadActivities();
      const activity = activities.find((a) => a.activity_id === activityId);
      if (!activity) {
        return HttpResponse.json(
          { message: "Activity not found" },
          { status: 404 }
        );
      }

      const bookings = loadBookings();
      const currentActivityId = bookings[guestId] ?? null;

      if (currentActivityId === activityId) {
        return HttpResponse.json({ status: "booked" });
      }

      if (activity.remaining === 0) {
        return HttpResponse.json(
          { message: "Activity is full" },
          { status: 409 }
        );
      }

      if (currentActivityId) {
        const currentActivity = activities.find(
          (a) => a.activity_id === currentActivityId
        );
        if (currentActivity) {
          currentActivity.remaining += 1;
        }
      }

      activity.remaining -= 1;
      bookings[guestId] = activityId;

      saveActivities(activities);
      saveBookings(bookings);

      return HttpResponse.json({ status: "booked" });
    }
  ),

  http.post(
    `${GATEWAY_URL}/activity/cancel/:activityId`,
    async ({ params, request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      const guestId = String(body["id"]);
      const activityId = String(params["activityId"]);

      const bookings = loadBookings();
      const currentActivityId = bookings[guestId] ?? null;

      if (currentActivityId !== activityId) {
        return HttpResponse.json(
          { message: "Activity not booked" },
          { status: 409 }
        );
      }

      bookings[guestId] = null;
      saveBookings(bookings);

      const activities = loadActivities();
      const activity = activities.find((a) => a.activity_id === activityId);
      if (activity) {
        activity.remaining += 1;
        saveActivities(activities);
      }

      return HttpResponse.json({ status: "cancelled" });
    }
  ),

  http.get(`${GATEWAY_URL}/activity/by-guest/:guestId`, ({ params }) => {
    const guestId = String(params["guestId"]);
    const bookings = loadBookings();

    return HttpResponse.json({ activity_id: bookings[guestId] ?? null });
  }),
];
