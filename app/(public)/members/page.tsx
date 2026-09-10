import type { Metadata } from "next";
import { getCurrentSession } from "@/lib/auth/session";
import { searchProfiles } from "@/modules/directory/service";
import { prisma } from "@/lib/db/prisma";
import { DirectoryFilters } from "@/components/public/DirectoryFilters";
import { MemberCard } from "@/components/public/MemberCard";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Member Directory",
  description: "Find verified Subzwari members around the world.",
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await getCurrentSession();
  const countries = await prisma.country.findMany({ orderBy: { displayOrder: "asc" }, select: { id: true, name: true } });

  const { results, page, totalPages } = await searchProfiles(
    {
      q: typeof searchParams.q === "string" ? searchParams.q : undefined,
      countryId: typeof searchParams.countryId === "string" ? searchParams.countryId : undefined,
      cityId: typeof searchParams.cityId === "string" ? searchParams.cityId : undefined,
      industry: typeof searchParams.industry === "string" ? searchParams.industry : undefined,
      openToNetworking: searchParams.openToNetworking === "1",
      openToMentorship: searchParams.openToMentorship === "1",
      page: searchParams.page ? Number(searchParams.page) : 1,
    },
    { viewerSignedIn: !!session?.user },
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">Member Directory</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Find verified Subzwari members around the world. Only verified, visible profiles appear here.
      </p>

      <div className="mt-8">
        <DirectoryFilters countries={countries} searchParams={searchParams} />
      </div>

      <div className="mt-8">
        {results.length === 0 ? (
          <EmptyState title="No members found" description="Try adjusting your filters." />
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
          return `/members?${params.toString()}`;
        }}
      />
    </div>
  );
}
