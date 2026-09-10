"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import {
  personalInfoSchema,
  professionalInfoSchema,
  familyInfoSchema,
  privacySettingsSchema,
} from "@/lib/validation/profile";
import type { ActionResult } from "@/modules/identity/actions";

async function getOwnProfileId(userId: string): Promise<string> {
  const profile = await prisma.profile.findUnique({ where: { userId }, select: { id: true } });
  if (!profile) throw new Error("Profile not found.");
  return profile.id;
}

export async function updatePersonalInfo(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = personalInfoSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;
  const profileId = await getOwnProfileId(session.user.id);

  await prisma.profile.update({
    where: { id: profileId },
    data: {
      firstName: data.firstName,
      middleName: data.middleName || null,
      lastName: data.lastName,
      gender: data.gender || null,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      countryId: data.countryId || null,
      cityId: data.cityId || null,
      currentResidence: data.currentResidence || null,
      nationality: data.nationality || null,
      bio: data.bio || null,
    },
  });

  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function updateProfessionalInfo(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = professionalInfoSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;
  const profileId = await getOwnProfileId(session.user.id);

  await prisma.$transaction([
    prisma.profile.update({
      where: { id: profileId },
      data: {
        profession: data.profession || null,
        jobTitle: data.jobTitle || null,
        company: data.company || null,
        industry: data.industry || null,
        skills: data.skills,
        education: data.education || null,
        university: data.university || null,
        linkedinUrl: data.linkedinUrl || null,
        websiteUrl: data.websiteUrl || null,
      },
    }),
    prisma.profileProfessionalCategory.deleteMany({ where: { profileId } }),
    ...(data.categoryIds.length > 0
      ? [
          prisma.profileProfessionalCategory.createMany({
            data: data.categoryIds.map((categoryId) => ({ profileId, categoryId })),
            skipDuplicates: true,
          }),
        ]
      : []),
  ]);

  revalidatePath("/dashboard/profile/professional");
  return { success: true };
}

export async function updateFamilyInfo(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = familyInfoSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;
  const profileId = await getOwnProfileId(session.user.id);

  await prisma.profile.update({
    where: { id: profileId },
    data: {
      fathersName: data.fathersName || null,
      grandfathersName: data.grandfathersName || null,
      greatGrandfathersName: data.greatGrandfathersName || null,
      ancestralRegion: data.ancestralRegion || null,
      familyInformation: data.familyInformation || null,
    },
  });

  revalidatePath("/dashboard/profile/family");
  return { success: true };
}

export async function updatePrivacySettings(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = privacySettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;
  const profileId = await getOwnProfileId(session.user.id);

  const profile = await prisma.profile.update({
    where: { id: profileId },
    data: {
      visibility: data.visibility,
      openToNetworking: data.openToNetworking,
      openToMentorship: data.openToMentorship,
      openToBusinessNetwork: data.openToBusinessNetwork,
      openToEvents: data.openToEvents,
      openToHelping: data.openToHelping,
    },
  });

  // isIndexable is only ever true for PUBLIC + VERIFIED — recomputed here
  // rather than trusted from the client (SECURITY.md §6).
  await prisma.profile.update({
    where: { id: profileId },
    data: { isIndexable: profile.visibility === "PUBLIC" && profile.verificationStatus === "VERIFIED" },
  });

  revalidatePath("/dashboard/profile/privacy");
  return { success: true };
}

export async function updateProfilePhoto(mediaId: string): Promise<ActionResult> {
  const session = await requireSession();
  const profileId = await getOwnProfileId(session.user.id);
  await prisma.profile.update({ where: { id: profileId }, data: { photoMediaId: mediaId } });
  revalidatePath("/dashboard/profile");
  return { success: true };
}
