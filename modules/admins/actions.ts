"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { requirePermission, PERMISSIONS } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { setSystemRoleSchema } from "@/lib/validation/admins";
import type { ActionResult } from "@/modules/identity/actions";

export async function setUserSystemRole(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_ADMINS_ROLES);

  const parsed = setSystemRoleSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return { success: false, error: "No account exists with that email." };
  if (user.id === actor.id && parsed.data.role !== "SUPER_ADMIN") {
    return { success: false, error: "You can't remove your own Super Admin access." };
  }

  await prisma.user.update({ where: { id: user.id }, data: { systemRole: parsed.data.role } });

  await writeAuditLog({
    actorId: actor.id,
    action: "user.setSystemRole",
    targetType: "User",
    targetId: user.id,
    metadata: { role: parsed.data.role },
  });

  revalidatePath("/admin/admins");
  return { success: true };
}
