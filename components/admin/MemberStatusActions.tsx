"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setMemberStatus } from "@/modules/verification/actions";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";

export function MemberStatusActions({ profileId, isSuspended }: { profileId: string; isSuspended: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  function act(decision: "SUSPENDED" | "RESTORED") {
    setError(null);
    startTransition(async () => {
      const result = await setMemberStatus({ profileId, decision, notes });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <Textarea placeholder="Notes (internal, audit-logged)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {isSuspended ? (
        <Button size="sm" onClick={() => act("RESTORED")} disabled={isPending}>
          Restore Member
        </Button>
      ) : (
        <Button size="sm" variant="danger" onClick={() => act("SUSPENDED")} disabled={isPending}>
          Suspend Member
        </Button>
      )}
    </div>
  );
}
