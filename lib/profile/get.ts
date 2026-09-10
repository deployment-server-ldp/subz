import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getOwnProfile(userId: string) {
  return prisma.profile.findUnique({
    where: { userId },
    include: {
      country: true,
      city: true,
      photoMedia: true,
      professionalCategories: { include: { category: true } },
    },
  });
}
