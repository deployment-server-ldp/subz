import { z } from "zod";

export const momentTypeEnum = z.enum([
  "CELEBRATION",
  "WEDDING",
  "GRADUATION",
  "BIRTHDAY",
  "BUSINESS_ACHIEVEMENT",
  "COMMUNITY_GATHERING",
  "FAMILY_GATHERING",
  "OTHER",
]);

export const submitMomentSchema = z.object({
  caption: z.string().trim().min(1, "Add a caption").max(500),
  type: momentTypeEnum,
  mediaId: z.string().uuid("Upload a photo first"),
});
