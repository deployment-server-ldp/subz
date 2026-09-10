import { getCurrentSession } from "@/lib/auth/session";
import { searchProfiles } from "@/modules/directory/service";
import { prisma } from "@/lib/db/prisma";
import { DirectoryFilters } from "@/components/public/DirectoryFilters";
import { ConnectableMemberCard } from "@/components/public/ConnectableMemberCard";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function NetworkDiscoveryPage({
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
      industry: typeof searchParams.industry === "string" ? searchParams.industry : undefined,
      openToNetworking: searchParams.openToNetworking === "1",
      openToMentorship: searchParams.openToMentorship === "1",
      page: searchParams.page ? Number(searchParams.page) : 1,
    },
    { viewerSignedIn: true },
  );

  const others = results.filter((p) => p.id !== session?.user.profileId);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Discover Subzwari</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Find and connect with other verified Subzwari members around the world.
      </p>

      <div className="mt-6">
        <DirectoryFilters countries={countries} searchParams={searchParams} />
      </div>

      <div className="mt-6">
        {others.length === 0 ? (
          <EmptyState title="No members found" description="Try adjusting your filters." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {others.map((profile) => (
              <ConnectableMemberCard key={profile.id} profile={profile} />
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
          return `/network?${params.toString()}`;
        }}
      />
    </div>
  );
}
