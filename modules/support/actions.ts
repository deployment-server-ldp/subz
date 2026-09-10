"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { requirePermission, PERMISSIONS } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { notify } from "@/lib/notifications";
import { supportRequestSchema, offerHelpSchema } from "@/lib/validation/support";
import type { ActionResult } from "@/modules/identity/actions";

export async function submitSupportRequest(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = supportRequestSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { success: false, error: "Profile not found." };

  await prisma.supportRequest.create({
    data: { ...parsed.data, requesterId: profile.id, status: "PENDING_REVIEW" },
  });

  revalidatePath("/dashboard/support");
  return { success: true };
}

export async function moderateSupportRequest(id: string, approve: boolean): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MODERATE_CONTENT_QUEUE);

  await prisma.supportRequest.update({
    where: { id },
    data: { status: approve ? "OPEN" : "REJECTED" },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: approve ? "supportRequest.approve" : "supportRequest.reject",
    targetType: "SupportRequest",
    targetId: id,
  });

  revalidatePath("/admin/support-requests");
  revalidatePath("/dashboard/support");
  return { success: true };
}

export async function offerHelp(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = offerHelpSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { success: false, error: "Profile not found." };

  const request = await prisma.supportRequest.findUnique({
    where: { id: parsed.data.supportRequestId },
    include: { requester: true },
  });
  if (!request || request.status !== "OPEN") return { success: false, error: "This request is not open." };
  if (request.requesterId === profile.id) return { success: false, error: "You can't offer help on your own request." };

  await prisma.supportOffer.create({
    data: { supportRequestId: request.id, helperId: profile.id, message: parsed.data.message },
  });

  await prisma.supportRequest.update({ where: { id: request.id }, data: { status: "IN_PROGRESS" } });

  await notify({
    recipientId: request.requester.userId,
    type: "SUPPORT_REQUEST_UPDATE",
    link: "/dashboard/support",
  });

  revalidatePath("/dashboard/support");
  return { success: true };
}

export async function closeSupportRequest(id: string, resolved: boolean): Promise<ActionResult> {
  const session = await requireSession();
  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { success: false, error: "Profile not found." };

  const request = await prisma.supportRequest.findUnique({ where: { id } });
  if (!request || request.requesterId !== profile.id) return { success: false, error: "Request not found." };

  await prisma.supportRequest.update({ where: { id }, data: { status: resolved ? "RESOLVED" : "CLOSED" } });
  revalidatePath("/dashboard/support");
  return { success: true };
}
