import { z } from "zod";

export const eventSchema = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().min(1, "Description is required").max(3000),
  startsAt: z.string().min(1, "Start date/time is required"),
  endsAt: z.string().optional().or(z.literal("")),
  location: z.string().trim().max(250).optional().or(z.literal("")),
  countryId: z.string().uuid().optional().or(z.literal("")),
  cityId: z.string().uuid().optional().or(z.literal("")),
  maxCapacity: z.coerce.number().int().positive().optional().or(z.literal("").transform(() => undefined)),
  requiresRsvp: z.boolean().default(true),
});
export type EventInput = z.infer<typeof eventSchema>;
