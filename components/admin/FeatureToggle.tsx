"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { ActionResult } from "@/modules/identity/actions";

export function FeatureToggle({
  id,
  featured,
  onToggle,
}: {
  id: string;
  featured: boolean;
  onToggle: (id: string, featured: boolean) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant={featured ? "secondary" : "ghost"}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await onToggle(id, !featured);
          router.refresh();
        })
      }
    >
      {featured ? "Unfeature" : "Feature"}
    </Button>
  );
}
