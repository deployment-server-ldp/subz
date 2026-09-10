import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().default(0),
});
export type CategoryInput = z.infer<typeof categorySchema>;
