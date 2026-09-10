import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { VerifiedBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSetting } from "@/lib/settings/get";

async function getHomepageData() {
  const [heroTitle, heroSubtitle, heroDescription, stats, countries, featuredMembers, categories, stories, moments] = await Promise.all([
    getSetting("GENERAL", "heroTitle", "SUBZWARI GLOBAL"),
    getSetting("GENERAL", "heroSubtitle", "SUBZWARI's ARE ONE"),
    getSetting(
      "GENERAL",
      "heroDescription",
      "Connecting Subzwari families, professionals and communities across the world.",
    ),
    Promise.all([
      prisma.profile.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.country.count({ where: { profiles: { some: { verificationStatus: "VERIFIED" } } } }),
      prisma.city.count({ where: { profiles: { some: { verificationStatus: "VERIFIED" } } } }),
      prisma.profile.count({ where: { verificationStatus: "VERIFIED", professionalCategories: { some: {} } } }),
      prisma.business.count({ where: { status: "APPROVED" } }),
      prisma.event.count({ where: { status: "PUBLISHED" } }),
    ]),
    prisma.country.findMany({
      orderBy: { displayOrder: "asc" },
      take: 12,
      include: { _count: { select: { profiles: { where: { verificationStatus: "VERIFIED" } } } } },
    }),
    prisma.profile.findMany({
      where: { verificationStatus: "VERIFIED", visibility: "PUBLIC" },
      take: 6,
      orderBy: { updatedAt: "desc" },
      include: { country: true, city: true },
    }),
    prisma.professionalCategory.findMany({ take: 10, orderBy: { displayOrder: "asc" } }),
    prisma.story.findMany({
      where: { status: "PUBLISHED" },
      take: 3,
      orderBy: { publishedAt: "desc" },
    }),
    prisma.moment.findMany({
      where: { status: "APPROVED", featured: true },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { media: true },
    }),
  ]);

  const [verifiedMembers, countryCount, cityCount, professionals, businesses, events] = stats;

  return {
    heroTitle,
    heroSubtitle,
    heroDescription,
    stats: { verifiedMembers, countryCount, cityCount, professionals, businesses, events },
    countries,
    featuredMembers,
    categories,
    stories,
    moments,
  };
}

export default async function HomePage() {
  const { heroTitle, heroSubtitle, heroDescription, stats, countries, featuredMembers, categories, stories, moments } =
    await getHomepageData();

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          One Name. One Community. One Network.
        </p>
        <h1 className="font-display text-5xl font-semibold sm:text-6xl">{heroTitle}</h1>
        <h2 className="font-display text-2xl text-muted-foreground sm:text-3xl">{heroSubtitle}</h2>
        <p className="max-w-2xl text-lg text-muted-foreground">{heroDescription}</p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <ButtonLink href="/register" size="lg">
            JOIN THE COMMUNITY
          </ButtonLink>
          <ButtonLink href="/community" variant="secondary" size="lg">
            EXPLORE THE COMMUNITY
          </ButtonLink>
        </div>
      </section>

      {/* Global Community stats */}
      <section className="border-t border-border bg-muted py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-display text-2xl font-semibold">Global Community</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Verified Members" value={stats.verifiedMembers} />
            <StatCard label="Countries" value={stats.countryCount} />
            <StatCard label="Cities" value={stats.cityCount} />
            <StatCard label="Professionals" value={stats.professionals} />
            <StatCard label="Businesses" value={stats.businesses} />
            <StatCard label="Community Events" value={stats.events} />
          </div>
        </div>
      </section>

      {/* Subzwari Around the World */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Subzwari Around the World</h2>
          <Link href="/countries" className="text-sm text-accent hover:underline">
            View all countries
          </Link>
        </div>
        {countries.length === 0 ? (
          <EmptyState
            className="mt-8"
            title="No communities yet"
            description="Be the first verified Subzwari from your country."
          />
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {countries.map((country) => (
              <Link
                key={country.id}
                href={`/country/${country.slug}`}
                className="rounded border border-border p-4 text-center transition hover:border-accent"
              >
                <p className="font-medium">{country.name}</p>
                <p className="text-xs text-muted-foreground">{country._count.profiles} members</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Meet Our Community */}
      <section className="border-t border-border bg-muted py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-2xl font-semibold">Meet Our Community</h2>
          {featuredMembers.length === 0 ? (
            <EmptyState className="mt-8" title="Members will appear here" description="Verified public profiles are featured once the community grows." />
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {featuredMembers.map((member) => (
                <Link key={member.id} href={`/members/${member.slug}`}>
                  <Card className="h-full hover:border-accent">
                    <p className="font-display text-lg font-semibold">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {[member.city?.name, member.country?.name].filter(Boolean).join(", ") || "Location not set"}
                    </p>
                    {member.profession ? <p className="text-sm text-muted-foreground">{member.profession}</p> : null}
                    <div className="mt-2">
                      <VerifiedBadge />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Professional Network */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl font-semibold">SUBZWARI Professional Network</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Connect with Subzwari professionals across industries — for mentorship, referrals,
          and business introductions.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/professionals?categoryId=${category.id}`}
              className="rounded-full border border-border px-4 py-2 text-sm hover:border-accent hover:text-accent"
            >
              {category.name}
            </Link>
          ))}
        </div>
        <ButtonLink href="/professionals" variant="secondary" size="sm" className="mt-6">
          Explore the Professional Network
        </ButtonLink>
      </section>

      {/* Stories */}
      {stories.length > 0 ? (
        <section className="border-t border-border bg-muted py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">Subzwari Stories</h2>
              <Link href="/stories" className="text-sm text-accent hover:underline">
                Read all stories
              </Link>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {stories.map((story) => (
                <Link key={story.id} href={`/stories/${story.slug}`}>
                  <Card className="h-full hover:border-accent">
                    <p className="font-display text-lg font-semibold">{story.title}</p>
                    {story.excerpt ? <p className="mt-2 text-sm text-muted-foreground">{story.excerpt}</p> : null}
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Community Moments */}
      {moments.length > 0 ? (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold">Community Moments</h2>
            <Link href="/moments" className="text-sm text-accent hover:underline">
              View all moments
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {moments.map((moment) => (
              <div key={moment.id} className="aspect-square rounded bg-muted" title={moment.caption} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Join CTA */}
      <section className="border-t border-border bg-accent py-20 text-accent-foreground">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 text-center">
          <h2 className="font-display text-3xl font-semibold">Join the Community</h2>
          <p className="max-w-xl">
            Wherever we are in the world, we are connected by one name. Become a verified part
            of the global Subzwari network.
          </p>
          <ButtonLink href="/register" variant="secondary" size="lg" className="bg-white text-accent hover:bg-white/90">
            JOIN THE COMMUNITY
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
