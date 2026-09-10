import { z } from "zod";

export const reportTargetTypeEnum = z.enum(["PROFILE", "BUSINESS", "STORY", "MOMENT", "EVENT", "SUPPORT_REQUEST"]);

export const reportReasonEnum = z.enum([
  "FAKE_PROFILE",
  "INCORRECT_INFORMATION",
  "HARASSMENT",
  "SPAM",
  "INAPPROPRIATE_CONTENT",
  "PRIVACY_CONCERN",
  "OTHER",
]);

export const submitReportSchema = z.object({
  targetType: reportTargetTypeEnum,
  targetId: z.string().uuid(),
  reason: reportReasonEnum,
  details: z.string().trim().max(1000).optional().or(z.literal("")),
});
