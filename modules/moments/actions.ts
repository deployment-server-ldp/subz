"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { requirePermission, PERMISSIONS } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { submitMomentSchema } from "@/lib/validation/moments";
import type { ActionResult } from "@/modules/identity/actions";
import type { ModerationStatus } from "@prisma/client";

export async function submitMoment(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = submitMomentSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { success: false, error: "Profile not found." };

  await prisma.moment.create({
    data: {
      caption: parsed.data.caption,
      type: parsed.data.type,
      submittedById: profile.id,
      status: "PENDING",
      media: { connect: { id: parsed.data.mediaId } },
    },
  });

  revalidatePath("/moments");
  return { success: true };
}

export async function moderateMoment(input: { id: string; status: ModerationStatus }): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MODERATE_CONTENT_QUEUE);

  const moment = await prisma.moment.update({ where: { id: input.id }, data: { status: input.status } });

  await writeAuditLog({
    actorId: actor.id,
    action: `moment.${input.status.toLowerCase()}`,
    targetType: "Moment",
    targetId: moment.id,
  });

  revalidatePath("/admin/moments");
  revalidatePath("/moments");
  return { success: true };
}

export async function toggleMomentFeatured(id: string, featured: boolean): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MODERATE_CONTENT_QUEUE);

  await prisma.moment.update({ where: { id }, data: { featured } });
  await writeAuditLog({
    actorId: actor.id,
    action: featured ? "moment.feature" : "moment.unfeature",
    targetType: "Moment",
    targetId: id,
  });

  revalidatePath("/admin/moments");
  revalidatePath("/moments");
  revalidatePath("/");
  return { success: true };
}
