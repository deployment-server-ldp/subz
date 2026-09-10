import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "SUBZWARI Businesses",
  description: "Discover Subzwari-owned businesses around the world.",
};

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const countryId = typeof searchParams.countryId === "string" ? searchParams.countryId : undefined;
  const categoryId = typeof searchParams.categoryId === "string" ? searchParams.categoryId : undefined;
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;

  const [businesses, countries, categories] = await Promise.all([
    prisma.business.findMany({
      where: {
        status: "APPROVED",
        ...(countryId ? { countryId } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { category: true, country: true, city: true },
    }),
    prisma.country.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.businessCategory.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">SUBZWARI Businesses</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">Discover Subzwari-owned businesses around the world.</p>

      <form method="get" className="mt-8 flex flex-wrap items-end gap-4 rounded border border-border p-4">
        <Input name="q" placeholder="Search businesses…" defaultValue={q} className="max-w-xs" />
        <Select name="countryId" defaultValue={countryId} className="max-w-xs">
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select name="categoryId" defaultValue={categoryId} className="max-w-xs">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Button type="submit" size="sm">
          Filter
        </Button>
      </form>

      <div className="mt-8">
        {businesses.length === 0 ? (
          <EmptyState title="No businesses found" description="Try adjusting your filters, or add your own business." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {businesses.map((business) => (
              <Link key={business.id} href={`/businesses/${business.slug}`}>
                <Card className="h-full hover:border-accent">
                  <p className="font-display text-lg font-semibold">{business.name}</p>
                  <p className="text-sm text-muted-foreground">{business.category.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {[business.city?.name, business.country.name].filter(Boolean).join(", ")}
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
