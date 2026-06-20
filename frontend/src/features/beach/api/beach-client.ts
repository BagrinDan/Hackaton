import { api } from "@/lib/api-client";
import {
  ActivitiesResponseSchema,
  ActivitySchema,
  ActivityByGuestResponseSchema,
  BookActivityResponseSchema,
  CancelActivityResponseSchema,
  type ActivitiesResponse,
  type Activity,
  type ActivityByGuestResponse,
  type BookActivityResponse,
  type CancelActivityResponse,
} from "@/features/beach/types";

export function getActivities(): Promise<ActivitiesResponse> {
  return api.beach.get(ActivitiesResponseSchema, "/activities");
}

export function getActivity(activityId: string): Promise<Activity> {
  return api.beach.get(ActivitySchema, `/activity/${activityId}`);
}

export function bookActivity(
  activityId: string,
  guestId: string
): Promise<BookActivityResponse> {
  return api.beach.post(
    BookActivityResponseSchema,
    `/activity/book/${activityId}`,
    {
      id: guestId,
    }
  );
}

export function cancelActivity(
  activityId: string,
  guestId: string
): Promise<CancelActivityResponse> {
  return api.beach.post(
    CancelActivityResponseSchema,
    `/activity/cancel/${activityId}`,
    { id: guestId }
  );
}

export function getActivityByGuest(
  guestId: string
): Promise<ActivityByGuestResponse> {
  return api.beach.get(
    ActivityByGuestResponseSchema,
    `/activity/by-guest/${guestId}`
  );
}
