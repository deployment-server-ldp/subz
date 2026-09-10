import { z } from "zod";

export const submitVerificationSchema = z.object({
  additionalNotes: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type SubmitVerificationInput = z.infer<typeof submitVerificationSchema>;

export const reviewDecisionSchema = z.object({
  requestId: z.string().uuid(),
  decision: z.enum(["APPROVED", "REJECTED", "MORE_INFO_REQUESTED"]),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type ReviewDecisionInput = z.infer<typeof reviewDecisionSchema>;

export const memberStatusSchema = z.object({
  profileId: z.string().uuid(),
  decision: z.enum(["SUSPENDED", "RESTORED"]),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type MemberStatusInput = z.infer<typeof memberStatusSchema>;
