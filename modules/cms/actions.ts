"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { requirePermission, PERMISSIONS } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { pageSchema, navItemSchema, footerItemSchema } from "@/lib/validation/cms";
import type { ActionResult } from "@/modules/identity/actions";

export async function upsertPage(id: string | undefined, input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_SETTINGS);
  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  if (id) {
    await prisma.page.update({ where: { id }, data: parsed.data });
  } else {
    const existing = await prisma.page.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) return { success: false, error: "A page with that slug already exists." };
    await prisma.page.create({ data: parsed.data });
  }

  await writeAuditLog({ actorId: actor.id, action: id ? "page.update" : "page.create", targetType: "Page", targetId: id });
  revalidatePath("/admin/cms/pages");
  revalidatePath(`/${parsed.data.slug}`);
  return { success: true };
}

export async function deletePage(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_SETTINGS);
  await prisma.page.delete({ where: { id } });
  await writeAuditLog({ actorId: actor.id, action: "page.delete", targetType: "Page", targetId: id });
  revalidatePath("/admin/cms/pages");
  return { success: true };
}

export async function createNavItem(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_SETTINGS);
  const parsed = navItemSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  const item = await prisma.navigationItem.create({ data: parsed.data });
  await writeAuditLog({ actorId: actor.id, action: "navigation.create", targetType: "NavigationItem", targetId: item.id });
  revalidatePath("/admin/cms/navigation");
  return { success: true };
}

export async function deleteNavItem(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_SETTINGS);
  await prisma.navigationItem.delete({ where: { id } });
  await writeAuditLog({ actorId: actor.id, action: "navigation.delete", targetType: "NavigationItem", targetId: id });
  revalidatePath("/admin/cms/navigation");
  return { success: true };
}

export async function createFooterItem(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_SETTINGS);
  const parsed = footerItemSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  const item = await prisma.footerItem.create({ data: parsed.data });
  await writeAuditLog({ actorId: actor.id, action: "footer.create", targetType: "FooterItem", targetId: item.id });
  revalidatePath("/admin/cms/footer");
  revalidatePath("/");
  return { success: true };
}

export async function deleteFooterItem(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_SETTINGS);
  await prisma.footerItem.delete({ where: { id } });
  await writeAuditLog({ actorId: actor.id, action: "footer.delete", targetType: "FooterItem", targetId: id });
  revalidatePath("/admin/cms/footer");
  revalidatePath("/");
  return { success: true };
}
