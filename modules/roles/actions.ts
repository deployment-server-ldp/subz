"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { requirePermission, PERMISSIONS } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { slugify } from "@/lib/slug";
import { createRoleSchema, assignRoleSchema } from "@/lib/validation/roles";
import type { ActionResult } from "@/modules/identity/actions";

export async function createCustomRole(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_ADMINS_ROLES);

  const parsed = createRoleSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const key = slugify(parsed.data.name);
  const existing = await prisma.role.findUnique({ where: { key } });
  if (existing) return { success: false, error: "A role with that name already exists." };

  const permissions = await prisma.permission.findMany({ where: { key: { in: parsed.data.permissionKeys } } });

  const role = await prisma.role.create({
    data: {
      key,
      name: parsed.data.name,
      permissions: { create: permissions.map((p) => ({ permissionId: p.id })) },
    },
  });

  await writeAuditLog({ actorId: actor.id, action: "role.create", targetType: "Role", targetId: role.id });
  revalidatePath("/admin/roles-permissions");
  return { success: true };
}

export async function assignRoleToUser(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_ADMINS_ROLES);

  const parsed = assignRoleSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return { success: false, error: "No account exists with that email." };

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: parsed.data.roleId } },
    create: { userId: user.id, roleId: parsed.data.roleId },
    update: {},
  });

  await writeAuditLog({
    actorId: actor.id,
    action: "role.assign",
    targetType: "User",
    targetId: user.id,
    metadata: { roleId: parsed.data.roleId },
  });

  revalidatePath("/admin/roles-permissions");
  return { success: true };
}
