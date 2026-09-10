import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const revalidate = 300;

export async function GET() {
  const [verifiedMembers, countries, cities, professionals, businesses, events] = await Promise.all([
    prisma.profile.count({ where: { verificationStatus: "VERIFIED" } }),
    prisma.country.count({ where: { profiles: { some: { verificationStatus: "VERIFIED" } } } }),
    prisma.city.count({ where: { profiles: { some: { verificationStatus: "VERIFIED" } } } }),
    prisma.profile.count({ where: { verificationStatus: "VERIFIED", professionalCategories: { some: {} } } }),
    prisma.business.count({ where: { status: "APPROVED" } }),
    prisma.event.count({ where: { status: "PUBLISHED" } }),
  ]);

  return NextResponse.json({ verifiedMembers, countries, cities, professionals, businesses, events });
}
