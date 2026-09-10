"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { requirePermission, PERMISSIONS } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { notify } from "@/lib/notifications";
import { slugify, uniqueSlug } from "@/lib/slug";
import { businessSchema, moderationDecisionSchema } from "@/lib/validation/business";
import type { ActionResult } from "@/modules/identity/actions";

export async function submitBusiness(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = businessSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { success: false, error: "Profile not found." };

  const data = parsed.data;
  const baseSlug = slugify(data.name);
  const slugTaken = await prisma.business.findUnique({ where: { slug: baseSlug } });
  const slug = slugTaken ? uniqueSlug(data.name) : baseSlug;

  await prisma.business.create({
    data: {
      name: data.name,
      slug,
      ownerId: profile.id,
      categoryId: data.categoryId,
      countryId: data.countryId,
      cityId: data.cityId || null,
      website: data.website || null,
      description: data.description,
      contactMethod: data.contactMethod || null,
      status: "PENDING",
    },
  });

  revalidatePath("/dashboard/businesses");
  return { success: true };
}

export async function moderateBusiness(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_BUSINESSES);
  const parsed = moderationDecisionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  const business = await prisma.business.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
    include: { owner: { include: { user: true } } },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: `business.${parsed.data.status.toLowerCase()}`,
    targetType: "Business",
    targetId: business.id,
  });

  if (parsed.data.status === "APPROVED") {
    await notify({ recipientId: business.owner.userId, type: "BUSINESS_APPROVED", link: `/businesses/${business.slug}` });
  }

  revalidatePath("/admin/businesses");
  revalidatePath(`/admin/businesses/${business.id}`);
  revalidatePath("/businesses");
  return { success: true };
}

export async function withdrawBusiness(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { success: false, error: "Profile not found." };

  const business = await prisma.business.findUnique({ where: { id } });
  if (!business || business.ownerId !== profile.id) return { success: false, error: "Business not found." };
  if (business.status === "APPROVED") {
    return { success: false, error: "Contact an administrator to remove an approved listing." };
  }

  await prisma.business.delete({ where: { id } });
  revalidatePath("/dashboard/businesses");
  return { success: true };
}
