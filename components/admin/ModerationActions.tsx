"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { ActionResult } from "@/modules/identity/actions";

/** Reused approve/reject/suspend control for any moderation-status entity (business, event review, etc.). */
export function ModerationActions({
  id,
  currentStatus,
  onDecide,
}: {
  id: string;
  currentStatus: string;
  onDecide: (input: { id: string; status: "APPROVED" | "REJECTED" | "SUSPENDED" }) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function act(status: "APPROVED" | "REJECTED" | "SUSPENDED") {
    setError(null);
    startTransition(async () => {
      const result = await onDecide({ id, status });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {currentStatus !== "APPROVED" ? (
          <Button size="sm" onClick={() => act("APPROVED")} disabled={isPending}>
            Approve
          </Button>
        ) : null}
        {currentStatus !== "REJECTED" ? (
          <Button size="sm" variant="danger" onClick={() => act("REJECTED")} disabled={isPending}>
            Reject
          </Button>
        ) : null}
        {currentStatus !== "SUSPENDED" ? (
          <Button size="sm" variant="secondary" onClick={() => act("SUSPENDED")} disabled={isPending}>
            Suspend
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
