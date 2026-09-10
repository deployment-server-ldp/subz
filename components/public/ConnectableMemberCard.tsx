"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { sendConnectionRequest } from "@/modules/connections/actions";
import { Card } from "@/components/ui/Card";
import { VerifiedBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function ConnectableMemberCard({
  profile,
}: {
  profile: {
    id: string;
    slug: string;
    firstName: string;
    lastName: string;
    profession: string | null;
    country: { name: string } | null;
    city: { name: string } | null;
  };
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  return (
    <Card className="h-full">
      <Link href={`/members/${profile.slug}`}>
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
      </Link>
      <Button
        size="sm"
        variant="secondary"
        className="mt-3"
        disabled={isPending || !!status}
        onClick={() =>
          startTransition(async () => {
            const result = await sendConnectionRequest({ toProfileId: profile.id });
            setStatus(result.success ? "Request sent" : result.error);
          })
        }
      >
        {status ?? "Connect"}
      </Button>
    </Card>
  );
}
