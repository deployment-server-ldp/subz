import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { StatCard } from "@/components/ui/StatCard";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const city = await prisma.city.findFirst({ where: { slug: params.slug }, include: { country: true } });
  if (!city) return {};
  return { title: `Subzwari in ${city.name}, ${city.country.name}` };
}

export default async function CityDetailPage({ params }: { params: { slug: string } }) {
  // City slugs are unique per-country, not globally; this route takes the
  // first match, which is correct as long as seed/admin data avoids
  // cross-country slug collisions (documented limitation — see DATABASE.md).
  const city = await prisma.city.findFirst({ where: { slug: params.slug }, include: { country: true } });
  if (!city) notFound();

  const [memberCount, businessCount, eventCount] = await Promise.all([
    prisma.profile.count({ where: { cityId: city.id, verificationStatus: "VERIFIED", visibility: { in: ["PUBLIC", "COMMUNITY"] } } }),
    prisma.business.count({ where: { cityId: city.id, status: "APPROVED" } }),
    prisma.event.count({ where: { cityId: city.id, status: "PUBLISHED" } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-sm uppercase tracking-wide text-accent">
        <Link href={`/country/${city.country.slug}`} className="hover:underline">
          {city.country.name}
        </Link>
      </p>
      <h1 className="font-display text-4xl font-semibold">Subzwari in {city.name}</h1>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <StatCard label="Verified Members" value={memberCount} />
        <StatCard label="Businesses" value={businessCount} />
        <StatCard label="Events" value={eventCount} />
      </div>

      <div className="mt-10 flex flex-wrap gap-3 text-sm">
        <Link href={`/members?cityId=${city.id}`} className="text-accent hover:underline">
          View members in {city.name}
        </Link>
        <Link href={`/businesses?cityId=${city.id}`} className="text-accent hover:underline">
          View businesses in {city.name}
        </Link>
      </div>
    </div>
  );
}
