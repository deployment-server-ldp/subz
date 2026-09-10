import { z } from "zod";

export const supportCategoryEnum = z.enum([
  "CAREER_GUIDANCE",
  "PROFESSIONAL_ADVICE",
  "MENTORSHIP",
  "RELOCATION_GUIDANCE",
  "BUSINESS_INTRODUCTION",
  "EDUCATION_GUIDANCE",
  "GENERAL_ASSISTANCE",
]);

export const supportRequestSchema = z.object({
  category: supportCategoryEnum,
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().min(1, "Description is required").max(2000),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  visibility: z.enum(["PUBLIC", "COMMUNITY", "PRIVATE"]).default("COMMUNITY"),
  contactPreference: z.enum(["PLATFORM_MESSAGE", "EMAIL", "EITHER"]).default("PLATFORM_MESSAGE"),
});
export type SupportRequestInput = z.infer<typeof supportRequestSchema>;

export const offerHelpSchema = z.object({
  supportRequestId: z.string().uuid(),
  message: z.string().trim().min(1, "Add a short message").max(1000),
});
