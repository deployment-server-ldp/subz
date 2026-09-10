"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { requirePermission, PERMISSIONS, type PermissionKey } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { slugify } from "@/lib/slug";
import { categorySchema } from "@/lib/validation/categories";
import type { ActionResult } from "@/modules/identity/actions";

type CategoryKind = "professional" | "business" | "story";

const CONFIG: Record<
  CategoryKind,
  { permission: PermissionKey; path: string; delegate: () => any }
> = {
  professional: {
    permission: PERMISSIONS.MANAGE_COUNTRIES_CITIES, // catalog data, same low-risk tier
    path: "/admin/professional-categories",
    delegate: () => prisma.professionalCategory,
  },
  business: {
    permission: PERMISSIONS.MANAGE_BUSINESSES,
    path: "/admin/business-categories",
    delegate: () => prisma.businessCategory,
  },
  story: {
    permission: PERMISSIONS.MANAGE_STORIES_MOMENTS,
    path: "/admin/story-categories",
    delegate: () => prisma.storyCategory,
  },
};

async function createCategory(kind: CategoryKind, input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const config = CONFIG[kind];
  const actor = await requirePermission(session, config.permission);
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const slug = slugify(parsed.data.name);
  const existing = await config.delegate().findUnique({ where: { slug } });
  if (existing) return { success: false, error: "A category with that name already exists." };

  const category = await config.delegate().create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      ...(kind !== "story" ? { displayOrder: parsed.data.displayOrder } : {}),
    },
  });

  await writeAuditLog({ actorId: actor.id, action: `${kind}Category.create`, targetType: "Category", targetId: category.id });
  revalidatePath(config.path);
  return { success: true };
}

async function deleteCategory(kind: CategoryKind, id: string): Promise<ActionResult> {
  const session = await requireSession();
  const config = CONFIG[kind];
  const actor = await requirePermission(session, config.permission);

  try {
    await config.delegate().delete({ where: { id } });
  } catch {
    return { success: false, error: "This category is in use and cannot be deleted." };
  }

  await writeAuditLog({ actorId: actor.id, action: `${kind}Category.delete`, targetType: "Category", targetId: id });
  revalidatePath(config.path);
  return { success: true };
}

export async function createProfessionalCategory(input: unknown): Promise<ActionResult> {
  return createCategory("professional", input);
}
export async function deleteProfessionalCategory(id: string): Promise<ActionResult> {
  return deleteCategory("professional", id);
}
export async function createBusinessCategory(input: unknown): Promise<ActionResult> {
  return createCategory("business", input);
}
export async function deleteBusinessCategory(id: string): Promise<ActionResult> {
  return deleteCategory("business", id);
}
export async function createStoryCategory(input: unknown): Promise<ActionResult> {
  return createCategory("story", input);
}
export async function deleteStoryCategory(id: string): Promise<ActionResult> {
  return deleteCategory("story", id);
}
