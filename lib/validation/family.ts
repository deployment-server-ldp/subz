import { z } from "zod";

export const familyBranchSchema = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  region: z.string().trim().max(150).optional().or(z.literal("")),
  historicalInformation: z.string().trim().max(4000).optional().or(z.literal("")),
});
export type FamilyBranchInput = z.infer<typeof familyBranchSchema>;

export const relationshipTypeEnum = z.enum([
  "FATHER",
  "MOTHER",
  "SON",
  "DAUGHTER",
  "BROTHER",
  "SISTER",
  "SPOUSE",
  "GRANDFATHER",
  "GRANDMOTHER",
  "UNCLE",
  "AUNT",
  "COUSIN",
]);

export const requestRelationshipSchema = z.object({
  memberSlug: z.string().trim().min(1, "Enter the member's profile link or slug"),
  relationshipType: relationshipTypeEnum,
  visibility: z.enum(["PUBLIC", "COMMUNITY", "PRIVATE"]).default("PRIVATE"),
});
