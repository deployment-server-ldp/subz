"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { requirePermission, PERMISSIONS } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { submitReportSchema } from "@/lib/validation/reports";
import type { ActionResult } from "@/modules/identity/actions";

export async function submitReport(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = submitReportSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const limit = rateLimit(`report:${session.user.id}`, 10, 60 * 60_000);
  if (!limit.allowed) return { success: false, error: "Too many reports submitted. Please try again later." };

  await prisma.report.create({
    data: {
      reporterId: session.user.id,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      reason: parsed.data.reason,
      details: parsed.data.details || null,
    },
  });

  return { success: true };
}

export async function resolveReport(input: { id: string; status: "RESOLVED" | "DISMISSED"; note?: string }): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MODERATE_REPORTS);

  const report = await prisma.report.update({
    where: { id: input.id },
    data: { status: input.status, resolvedById: actor.id, resolutionNote: input.note || null },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: `report.${input.status.toLowerCase()}`,
    targetType: "Report",
    targetId: report.id,
    metadata: { reportedTargetType: report.targetType, reportedTargetId: report.targetId },
  });

  revalidatePath("/admin/reports");
  return { success: true };
}
