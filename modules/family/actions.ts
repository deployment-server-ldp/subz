"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { requirePermission, PERMISSIONS } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { slugify } from "@/lib/slug";
import { familyBranchSchema, requestRelationshipSchema } from "@/lib/validation/family";
import type { ActionResult } from "@/modules/identity/actions";

async function getOwnProfile(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Profile not found.");
  return profile;
}

export async function createFamilyBranch(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_FAMILY_BRANCHES);
  const parsed = familyBranchSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const data = parsed.data;
  const slug = slugify(data.name);
  const existing = await prisma.familyBranch.findUnique({ where: { slug } });
  if (existing) return { success: false, error: "A branch with that name already exists." };

  const branch = await prisma.familyBranch.create({
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      region: data.region || null,
      historicalInformation: data.historicalInformation || null,
    },
  });

  await writeAuditLog({ actorId: actor.id, action: "familyBranch.create", targetType: "FamilyBranch", targetId: branch.id });
  revalidatePath("/admin/family-branches");
  revalidatePath("/family");
  return { success: true };
}

export async function updateFamilyBranch(id: string, input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_FAMILY_BRANCHES);
  const parsed = familyBranchSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const data = parsed.data;
  await prisma.familyBranch.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description || null,
      region: data.region || null,
      historicalInformation: data.historicalInformation || null,
    },
  });

  await writeAuditLog({ actorId: actor.id, action: "familyBranch.update", targetType: "FamilyBranch", targetId: id });
  revalidatePath("/admin/family-branches");
  revalidatePath("/family");
  return { success: true };
}

export async function requestBranchMembership(branchId: string): Promise<ActionResult> {
  const session = await requireSession();
  const profile = await getOwnProfile(session.user.id);

  const existing = await prisma.familyBranchMembership.findUnique({
    where: { profileId_branchId: { profileId: profile.id, branchId } },
  });
  if (existing) return { success: false, error: "You've already requested this branch." };

  await prisma.familyBranchMembership.create({ data: { profileId: profile.id, branchId } });
  revalidatePath(`/family/branches`);
  return { success: true };
}

export async function decideBranchMembership(membershipId: string, approve: boolean): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_FAMILY_BRANCHES);

  const membership = await prisma.familyBranchMembership.update({
    where: { id: membershipId },
    data: { status: approve ? "APPROVED" : "REJECTED" },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: approve ? "familyBranchMembership.approve" : "familyBranchMembership.reject",
    targetType: "FamilyBranchMembership",
    targetId: membership.id,
  });

  revalidatePath(`/admin/family-branches/${membership.branchId}`);
  return { success: true };
}

export async function requestFamilyRelationship(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = requestRelationshipSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const me = await getOwnProfile(session.user.id);
  const target = await prisma.profile.findUnique({ where: { slug: parsed.data.memberSlug.trim() } });
  if (!target) return { success: false, error: "We couldn't find a member with that profile link." };
  if (target.id === me.id) return { success: false, error: "You can't add yourself as a relative." };

  const existing = await prisma.familyRelationship.findFirst({
    where: { fromProfileId: me.id, toProfileId: target.id, relationshipType: parsed.data.relationshipType },
  });
  if (existing) return { success: false, error: "You've already sent this request." };

  await prisma.familyRelationship.create({
    data: {
      fromProfileId: me.id,
      toProfileId: target.id,
      relationshipType: parsed.data.relationshipType,
      visibility: parsed.data.visibility,
    },
  });

  revalidatePath("/dashboard/profile/family");
  return { success: true };
}

export async function respondFamilyRelationship(relationshipId: string, accept: boolean): Promise<ActionResult> {
  const session = await requireSession();
  const me = await getOwnProfile(session.user.id);

  const relationship = await prisma.familyRelationship.findUnique({ where: { id: relationshipId } });
  if (!relationship || relationship.toProfileId !== me.id) {
    return { success: false, error: "Request not found." };
  }

  await prisma.familyRelationship.update({
    where: { id: relationshipId },
    data: { status: accept ? "CONFIRMED" : "DECLINED" },
  });

  revalidatePath("/dashboard/profile/family");
  return { success: true };
}
