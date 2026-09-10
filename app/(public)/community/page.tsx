import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Community",
  description: "Explore every part of the SUBZWARI Global Network community.",
};

const SECTIONS = [
  { href: "/members", label: "Member Directory", description: "Find verified Subzwari members worldwide." },
  { href: "/professionals", label: "Professional Network", description: "Connect with Subzwari professionals." },
  { href: "/businesses", label: "Businesses", description: "Discover Subzwari-owned businesses." },
  { href: "/countries", label: "Countries", description: "Explore regional Subzwari communities." },
  { href: "/family", label: "Family Heritage", description: "Family branches and shared lineage." },
  { href: "/stories", label: "Stories", description: "Heritage, achievement, and community stories." },
  { href: "/moments", label: "Moments", description: "Celebrations and community gatherings." },
  { href: "/events", label: "Events", description: "Upcoming community events." },
];

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">Community</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Wherever we are in the world, we are connected by one name. Explore every part of the
        SUBZWARI Global Network community.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full hover:border-accent">
              <p className="font-display text-lg font-semibold">{section.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
