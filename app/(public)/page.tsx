// Homepage — MVP placeholder shell.
//
// This is intentionally minimal: hero copy + section anchors matching
// ARCHITECTURE.md §"Homepage Experience" / §B sitemap. Real data-backed
// sections (Global Community stats, world map, member/story/moment feeds)
// are built in MVP Phase 5+ once the CMS-backed data sources exist —
// wiring them to hardcoded numbers now would violate the "admin-first,
// nothing hardcoded" principle this platform is built around.

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-accent">
        One Name. One Community. One Network.
      </p>
      <h1 className="font-display text-5xl font-semibold sm:text-6xl">
        SUBZWARI GLOBAL
      </h1>
      <h2 className="font-display text-2xl text-muted-foreground sm:text-3xl">
        SUBZWARI&rsquo;s ARE ONE
      </h2>
      <p className="max-w-2xl text-lg text-muted-foreground">
        Connecting Subzwari families, professionals and communities across the
        world.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <a
          href="/register"
          className="rounded bg-accent px-6 py-3 font-medium text-accent-foreground"
        >
          JOIN THE COMMUNITY
        </a>
        <a
          href="/community"
          className="rounded border border-border px-6 py-3 font-medium"
        >
          EXPLORE THE COMMUNITY
        </a>
      </div>
    </main>
  );
}
