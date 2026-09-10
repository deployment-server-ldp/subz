import { z } from "zod";

export const sendConnectionRequestSchema = z.object({
  toProfileId: z.string().uuid(),
});

export const respondConnectionSchema = z.object({
  connectionId: z.string().uuid(),
  accept: z.boolean(),
});

export const sendContactRequestSchema = z.object({
  toProfileId: z.string().uuid(),
  message: z.string().trim().min(1, "Enter a message").max(1000),
});
