import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const country = await prisma.country.findUnique({ where: { slug: params.slug } });
  if (!country) return {};
  return {
    title: `Subzwari in ${country.name}`,
    description: country.summary ?? `Explore the verified Subzwari community in ${country.name}.`,
  };
}

export default async function CountryDetailPage({ params }: { params: { slug: string } }) {
  const country = await prisma.country.findUnique({ where: { slug: params.slug } });
  if (!country) notFound();

  const [memberCount, cities, businessCount, eventCount, professionalCount] = await Promise.all([
    prisma.profile.count({ where: { countryId: country.id, verificationStatus: "VERIFIED", visibility: { in: ["PUBLIC", "COMMUNITY"] } } }),
    prisma.city.findMany({ where: { countryId: country.id }, orderBy: { name: "asc" } }),
    prisma.business.count({ where: { countryId: country.id, status: "APPROVED" } }),
    prisma.event.count({ where: { countryId: country.id, status: "PUBLISHED" } }),
    prisma.profile.count({
      where: { countryId: country.id, verificationStatus: "VERIFIED", professionalCategories: { some: {} } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-sm uppercase tracking-wide text-accent">SUBZWARI IN</p>
      <h1 className="font-display text-4xl font-semibold">{country.name}</h1>
      {country.summary ? <p className="mt-3 max-w-2xl text-muted-foreground">{country.summary}</p> : null}

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Verified Members" value={memberCount} />
        <StatCard label="Cities" value={cities.length} />
        <StatCard label="Professionals" value={professionalCount} />
        <StatCard label="Businesses" value={businessCount} />
      </div>

      {cities.length > 0 ? (
        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold">Cities</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {cities.map((city) => (
              <Link
                key={city.id}
                href={`/cities/${city.slug}`}
                className="rounded-full border border-border px-3 py-1 text-sm hover:border-accent hover:text-accent"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href={`/members?countryId=${country.id}`}>
          <Card className="px-4 py-3 text-sm hover:border-accent">View members in {country.name}</Card>
        </Link>
        <Link href={`/businesses?countryId=${country.id}`}>
          <Card className="px-4 py-3 text-sm hover:border-accent">View businesses in {country.name}</Card>
        </Link>
        <Link href={`/events?countryId=${country.id}`}>
          <Card className="px-4 py-3 text-sm hover:border-accent">View events in {country.name}</Card>
        </Link>
      </div>
    </div>
  );
}
