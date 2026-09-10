"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { moderateSupportRequest } from "@/modules/support/actions";
import { Button } from "@/components/ui/Button";

export function SupportModerationActions({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function act(approve: boolean) {
    startTransition(async () => {
      await moderateSupportRequest(id, approve);
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
