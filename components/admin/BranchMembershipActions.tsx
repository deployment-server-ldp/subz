"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { decideBranchMembership } from "@/modules/family/actions";
import { Button } from "@/components/ui/Button";

export function BranchMembershipActions({ membershipId }: { membershipId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function act(approve: boolean) {
    startTransition(async () => {
      await decideBranchMembership(membershipId, approve);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => act(true)} disabled={isPending}>
        Approve
      </Button>
      <Button size="sm" variant="danger" onClick={() => act(false)} disabled={isPending}>
        Reject
      </Button>
    </div>
  );
}
