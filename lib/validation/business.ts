import { z } from "zod";

export const businessSchema = z.object({
  name: z.string().trim().min(1).max(150),
  categoryId: z.string().uuid("Select a category"),
  countryId: z.string().uuid("Select a country"),
  cityId: z.string().uuid().optional().or(z.literal("")),
  website: z.string().trim().url().optional().or(z.literal("")),
  description: z.string().trim().min(1, "Description is required").max(2000),
  contactMethod: z.string().trim().max(200).optional().or(z.literal("")),
});
export type BusinessInput = z.infer<typeof businessSchema>;

export const moderationDecisionSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["APPROVED", "REJECTED", "SUSPENDED"]),
});
