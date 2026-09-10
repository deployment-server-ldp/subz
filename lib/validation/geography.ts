import { z } from "zod";

export const countrySchema = z.object({
  name: z.string().trim().min(1).max(100),
  isoCode: z.string().trim().max(3).optional().or(z.literal("")),
  summary: z.string().trim().max(2000).optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().default(0),
});
export type CountryInput = z.infer<typeof countrySchema>;

export const citySchema = z.object({
  name: z.string().trim().min(1).max(100),
  countryId: z.string().uuid("Select a country"),
});
export type CityInput = z.infer<typeof citySchema>;
