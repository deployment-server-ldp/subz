import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

const PAGE_SIZE = 12;

export interface DirectoryFilters {
  q?: string;
  countryId?: string;
  cityId?: string;
  industry?: string;
  categoryId?: string;
  openToNetworking?: boolean;
  openToMentorship?: boolean;
  page?: number;
}

/**
 * Shared query builder for the public member and professional directories.
 * Directory results only ever include VERIFIED profiles (ARCHITECTURE.md §I
 * — unverified members are excluded from search until verified), and only
 * PUBLIC profiles unless the viewer is a signed-in member (who may also see
 * COMMUNITY-visibility profiles).
 */
export async function searchProfiles(
  filters: DirectoryFilters,
  options: { viewerSignedIn: boolean; requireProfessional?: boolean },
) {
  const page = Math.max(1, filters.page ?? 1);

  const where: Prisma.ProfileWhereInput = {
    verificationStatus: "VERIFIED",
    visibility: options.viewerSignedIn ? { in: ["PUBLIC", "COMMUNITY"] } : "PUBLIC",
    ...(filters.q
      ? {
          OR: [
            { firstName: { contains: filters.q, mode: "insensitive" } },
            { lastName: { contains: filters.q, mode: "insensitive" } },
            { profession: { contains: filters.q, mode: "insensitive" } },
            { company: { contains: filters.q, mode: "insensitive" } },
            { skills: { has: filters.q } },
          ],
        }
      : {}),
    ...(filters.countryId ? { countryId: filters.countryId } : {}),
    ...(filters.cityId ? { cityId: filters.cityId } : {}),
    ...(filters.industry ? { industry: { contains: filters.industry, mode: "insensitive" } } : {}),
    ...(filters.openToNetworking ? { openToNetworking: true } : {}),
    ...(filters.openToMentorship ? { openToMentorship: true } : {}),
    ...(options.requireProfessional ? { professionalCategories: { some: {} } } : {}),
    ...(filters.categoryId ? { professionalCategories: { some: { categoryId: filters.categoryId } } } : {}),
  };

  const [results, total] = await Promise.all([
    prisma.profile.findMany({
      where,
      include: { country: true, city: true, professionalCategories: { include: { category: true } } },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.profile.count({ where }),
  ]);

  return { results, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/**
 * Resolves a single profile by slug for public/detail viewing, applying the
 * same visibility rule so a direct link can't bypass privacy settings.
 */
export async function getVisibleProfileBySlug(slug: string, viewerSignedIn: boolean, viewerProfileId?: string) {
  const profile = await prisma.profile.findUnique({
    where: { slug },
    include: {
      country: true,
      city: true,
      photoMedia: true,
      professionalCategories: { include: { category: true } },
    },
  });
  if (!profile) return null;

  const isOwner = viewerProfileId === profile.id;
  if (isOwner) return profile;

  if (profile.visibility === "PRIVATE") return null;
  if (profile.visibility === "COMMUNITY" && !viewerSignedIn) return null;

  return profile;
}
