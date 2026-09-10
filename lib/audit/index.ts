import "server-only";
import { prisma } from "@/lib/db/prisma";

/**
 * Single write path for every admin/state-changing action (SECURITY.md §7).
 * Every mutation in lib/actions/* and modules/* that changes moderation
 * status, verification status, roles, or settings must call this.
 */
export async function writeAuditLog(params: {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      metadata: params.metadata as any,
    },
  });
}
