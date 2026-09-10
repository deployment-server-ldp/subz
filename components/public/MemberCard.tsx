import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { VerifiedBadge } from "@/components/ui/Badge";

export function MemberCard({
  profile,
}: {
  profile: {
    slug: string;
    firstName: string;
    lastName: string;
    profession: string | null;
    country: { name: string } | null;
    city: { name: string } | null;
  };
}) {
  return (
    <Link href={`/members/${profile.slug}`}>
      <Card className="h-full transition hover:border-accent">
        <p className="font-display text-lg font-semibold">
          {profile.firstName} {profile.lastName}
        </p>
        <p className="text-sm text-muted-foreground">
          {[profile.city?.name, profile.country?.name].filter(Boolean).join(", ") || "Location not set"}
        </p>
        {profile.profession ? <p className="text-sm text-muted-foreground">{profile.profession}</p> : null}
        <div className="mt-2">
          <VerifiedBadge />
        </div>
      </Card>
    </Link>
  );
}
