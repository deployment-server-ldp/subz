import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";

const STATIC_ROUTES = [
  "",
  "about",
  "history",
  "community",
  "members",
  "professionals",
  "businesses",
  "countries",
  "family",
  "stories",
  "moments",
  "events",
  "contact",
  "privacy",
  "terms",
  "community-guidelines",
  "verification",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const [countries, cities, businesses, events, stories, indexableProfiles] = await Promise.all([
    prisma.country.findMany({ select: { slug: true } }),
    prisma.city.findMany({ select: { slug: true } }),
    prisma.business.findMany({ where: { status: "APPROVED" }, select: { slug: true } }),
    prisma.event.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } }),
    prisma.story.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } }),
    prisma.profile.findMany({ where: { isIndexable: true }, select: { slug: true } }),
  ]);

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${base}/${path}`,
    lastModified: new Date(),
  }));

  for (const c of countries) entries.push({ url: `${base}/country/${c.slug}` });
  for (const c of cities) entries.push({ url: `${base}/cities/${c.slug}` });
  for (const b of businesses) entries.push({ url: `${base}/businesses/${b.slug}` });
  for (const e of events) entries.push({ url: `${base}/events/${e.slug}` });
  for (const s of stories) entries.push({ url: `${base}/stories/${s.slug}` });
  for (const p of indexableProfiles) entries.push({ url: `${base}/members/${p.slug}` });

  return entries;
}
