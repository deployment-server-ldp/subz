import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Subzwari Around the World",
  description: "Explore verified Subzwari communities by country.",
};

export default async function CountriesPage() {
  const countries = await prisma.country.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { profiles: { where: { verificationStatus: "VERIFIED" } } } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">Subzwari Around the World</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Wherever we are in the world, we are connected by one name. Explore verified Subzwari
        communities by country.
      </p>

      <div className="mt-10">
        {countries.length === 0 ? (
          <EmptyState title="No countries yet" description="Check back soon as the community grows." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {countries.map((country) => (
              <Link key={country.id} href={`/country/${country.slug}`}>
                <Card className="h-full transition hover:border-accent">
                  <p className="font-display text-lg font-semibold">{country.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {country._count.profiles} verified member{country._count.profiles === 1 ? "" : "s"}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
