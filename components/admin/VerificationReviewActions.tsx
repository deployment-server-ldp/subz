"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reviewVerification } from "@/modules/verification/actions";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";

export function VerificationReviewActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  function act(decision: "APPROVED" | "REJECTED" | "MORE_INFO_REQUESTED") {
    setError(null);
    startTransition(async () => {
      const result = await reviewVerification({ requestId, decision, notes });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <Textarea placeholder="Reviewer notes (shown to the member for rejections/more-info)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => act("APPROVED")} disabled={isPending}>
          Approve
        </Button>
        <Button variant="secondary" onClick={() => act("MORE_INFO_REQUESTED")} disabled={isPending}>
          Request More Information
        </Button>
        <Button variant="danger" onClick={() => act("REJECTED")} disabled={isPending}>
          Reject
        </Button>
      </div>
    </div>
  );
}
