"use server";

import { revalidatePath } from "next/cache";
import type { SettingCategory } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { requirePermission, PERMISSIONS } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import type { ActionResult } from "@/modules/identity/actions";

export async function upsertSetting(category: SettingCategory, key: string, value: string): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_SETTINGS);

  if (!key.trim()) return { success: false, error: "Key is required." };

  await prisma.siteSetting.upsert({
    where: { category_key: { category, key } },
    create: { category, key, value },
    update: { value },
  });

  await writeAuditLog({ actorId: actor.id, action: "setting.update", targetType: "SiteSetting", metadata: { category, key } });

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success: true };
}

export async function deleteSetting(category: SettingCategory, key: string): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_SETTINGS);

  await prisma.siteSetting.deleteMany({ where: { category, key } });
  await writeAuditLog({ actorId: actor.id, action: "setting.delete", targetType: "SiteSetting", metadata: { category, key } });

  revalidatePath("/admin/settings");
  return { success: true };
}
