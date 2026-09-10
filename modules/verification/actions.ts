"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { requirePermission, PERMISSIONS } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { notify } from "@/lib/notifications";
import { sendEmail } from "@/lib/email";
import {
  verificationApprovedEmail,
  verificationRejectedEmail,
  verificationMoreInfoEmail,
  verificationSubmittedEmail,
} from "@/lib/email/templates";
import {
  submitVerificationSchema,
  reviewDecisionSchema,
  memberStatusSchema,
} from "@/lib/validation/verification";
import type { ActionResult } from "@/modules/identity/actions";

const NON_RESUBMITTABLE = new Set(["PENDING", "UNDER_REVIEW", "VERIFIED"]);

export async function submitVerification(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = submitVerificationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { success: false, error: "Profile not found." };
  if (NON_RESUBMITTABLE.has(profile.verificationStatus)) {
    return { success: false, error: "You already have a verification request in progress." };
  }
  if (profile.verificationStatus === "SUSPENDED") {
    return { success: false, error: "Your account is suspended. Contact support for help." };
  }

  // Snapshot the fields a reviewer needs at submission time so later profile
  // edits don't silently change what was actually reviewed.
  const submissionData = {
    firstName: profile.firstName,
    middleName: profile.middleName,
    lastName: profile.lastName,
    country: profile.countryId,
    city: profile.cityId,
    fathersName: profile.fathersName,
    grandfathersName: profile.grandfathersName,
    greatGrandfathersName: profile.greatGrandfathersName,
    ancestralRegion: profile.ancestralRegion,
    familyInformation: profile.familyInformation,
    additionalNotes: parsed.data.additionalNotes || null,
    submittedAt: new Date().toISOString(),
  };

  await prisma.$transaction([
    prisma.verificationRequest.create({
      data: { profileId: profile.id, submissionData, status: "PENDING" },
    }),
    prisma.profile.update({ where: { id: profile.id }, data: { verificationStatus: "PENDING" } }),
  ]);

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user) await sendEmail(verificationSubmittedEmail(user.email));

  revalidatePath("/dashboard/verification");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function reviewVerification(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const reviewer = await requirePermission(session, PERMISSIONS.REVIEW_VERIFICATION);

  const parsed = reviewDecisionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { requestId, decision, notes } = parsed.data;

  const request = await prisma.verificationRequest.findUnique({
    where: { id: requestId },
    include: { profile: { include: { user: true } } },
  });
  if (!request) return { success: false, error: "Verification request not found." };

  const newProfileStatus = decision === "APPROVED" ? "VERIFIED" : decision;

  await prisma.$transaction([
    prisma.verificationReview.create({
      data: { verificationRequestId: requestId, reviewerId: reviewer.id, decision, notes: notes || null },
    }),
    prisma.verificationRequest.update({ where: { id: requestId }, data: { status: newProfileStatus } }),
    prisma.profile.update({
      where: { id: request.profileId },
      data: {
        verificationStatus: newProfileStatus,
        isIndexable: newProfileStatus === "VERIFIED" && request.profile.visibility === "PUBLIC",
      },
    }),
  ]);

  await writeAuditLog({
    actorId: reviewer.id,
    action: `verification.${decision.toLowerCase()}`,
    targetType: "Profile",
    targetId: request.profileId,
    metadata: { requestId, notes },
  });

  const recipientUserId = request.profile.userId;
  const email = request.profile.user.email;

  if (decision === "APPROVED") {
    await notify({ recipientId: recipientUserId, type: "VERIFICATION_APPROVED", link: "/dashboard" });
    await sendEmail(verificationApprovedEmail(email));
  } else if (decision === "REJECTED") {
    await notify({ recipientId: recipientUserId, type: "VERIFICATION_REJECTED", link: "/dashboard/verification" });
    await sendEmail(verificationRejectedEmail(email, notes || undefined));
  } else if (decision === "MORE_INFO_REQUESTED") {
    await notify({ recipientId: recipientUserId, type: "VERIFICATION_MORE_INFO", link: "/dashboard/verification" });
    await sendEmail(verificationMoreInfoEmail(email, notes || undefined));
  }

  revalidatePath(`/admin/verification/${requestId}`);
  revalidatePath("/admin/verification");
  return { success: true };
}

/** Suspend or restore a member independent of any specific VerificationRequest (e.g. after a report is upheld). */
export async function setMemberStatus(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_MEMBERS);

  const parsed = memberStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { profileId, decision, notes } = parsed.data;

  const profile = await prisma.profile.findUnique({ where: { id: profileId }, include: { user: true } });
  if (!profile) return { success: false, error: "Member not found." };

  const newStatus = decision === "SUSPENDED" ? "SUSPENDED" : "VERIFIED";

  await prisma.profile.update({
    where: { id: profileId },
    data: {
      verificationStatus: newStatus,
      isIndexable: newStatus === "VERIFIED" && profile.visibility === "PUBLIC",
    },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: decision === "SUSPENDED" ? "member.suspend" : "member.restore",
    targetType: "Profile",
    targetId: profileId,
    metadata: { notes },
  });

  revalidatePath(`/admin/members/${profileId}`);
  revalidatePath("/admin/members");
  return { success: true };
}
