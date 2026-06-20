import { z } from "zod";

export const ActivitySchema = z.object({
  activity_id: z.string(),
  activity_name: z.string(),
  description: z.string().nullish(),
  capacity: z.number().int(),
  remaining: z.number().int(),
});

export const ActivitiesResponseSchema = z.object({
  activities: z.array(ActivitySchema),
});

export const BookActivityRequestSchema = z.object({
  id: z.string(),
});

export const BookActivityResponseSchema = z.object({
  status: z.string(),
});

export const CancelActivityResponseSchema = z.object({
  status: z.string(),
});

export const ActivityByGuestResponseSchema = z.object({
  activity_id: z.string().nullable(),
});

export type Activity = z.infer<typeof ActivitySchema>;
export type ActivitiesResponse = z.infer<typeof ActivitiesResponseSchema>;
export type BookActivityRequest = z.infer<typeof BookActivityRequestSchema>;
export type BookActivityResponse = z.infer<typeof BookActivityResponseSchema>;
export type CancelActivityResponse = z.infer<
  typeof CancelActivityResponseSchema
>;
export type ActivityByGuestResponse = z.infer<
  typeof ActivityByGuestResponseSchema
>;
