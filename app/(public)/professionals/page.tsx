import type { Metadata } from "next";
import { getCurrentSession } from "@/lib/auth/session";
import { searchProfiles } from "@/modules/directory/service";
import { prisma } from "@/lib/db/prisma";
import { DirectoryFilters } from "@/components/public/DirectoryFilters";
import { MemberCard } from "@/components/public/MemberCard";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "SUBZWARI Professional Network",
  description: "Connect with verified Subzwari professionals across industries.",
};

export default async function ProfessionalsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await getCurrentSession();
  const [countries, categories] = await Promise.all([
    prisma.country.findMany({ orderBy: { displayOrder: "asc" }, select: { id: true, name: true } }),
    prisma.professionalCategory.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);

  const { results, page, totalPages } = await searchProfiles(
    {
      q: typeof searchParams.q === "string" ? searchParams.q : undefined,
      countryId: typeof searchParams.countryId === "string" ? searchParams.countryId : undefined,
      industry: typeof searchParams.industry === "string" ? searchParams.industry : undefined,
      categoryId: typeof searchParams.categoryId === "string" ? searchParams.categoryId : undefined,
      page: searchParams.page ? Number(searchParams.page) : 1,
    },
    { viewerSignedIn: !!session?.user, requireProfessional: true },
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">SUBZWARI Professional Network</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Connect with Subzwari professionals for mentorship, referrals, and business introductions.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <a
            key={c.id}
            href={`/professionals?categoryId=${c.id}`}
            className="rounded-full border border-border px-3 py-1 text-xs hover:border-accent hover:text-accent"
          >
            {c.name}
          </a>
        ))}
      </div>

      <div className="mt-8">
        <DirectoryFilters countries={countries} searchParams={searchParams} />
      </div>

      <div className="mt-8">
        {results.length === 0 ? (
          <EmptyState title="No professionals found" description="Try adjusting your filters." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {results.map((profile) => (
              <MemberCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(p) => {
          const params = new URLSearchParams(searchParams as Record<string, string>);
          params.set("page", String(p));
          return `/professionals?${params.toString()}`;
        }}
      />
    </div>
  );
}
