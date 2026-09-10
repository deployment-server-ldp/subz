"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { resolveReport } from "@/modules/reports/actions";
import { Button } from "@/components/ui/Button";

export function ReportResolveActions({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function act(status: "RESOLVED" | "DISMISSED") {
    startTransition(async () => {
      await resolveReport({ id, status });
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => act("RESOLVED")} disabled={isPending}>
        Mark Resolved
      </Button>
      <Button size="sm" variant="secondary" onClick={() => act("DISMISSED")} disabled={isPending}>
        Dismiss
      </Button>
    </div>
  );
}
