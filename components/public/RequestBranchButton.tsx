"use client";

import { useState, useTransition } from "react";
import { requestBranchMembership } from "@/modules/family/actions";
import { Button } from "@/components/ui/Button";

export function RequestBranchButton({ branchId }: { branchId: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div>
      <Button
        size="sm"
        variant="secondary"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await requestBranchMembership(branchId);
            setMessage(result.success ? "Request sent to community admins." : result.error);
          })
        }
      >
        Request to Join This Branch
      </Button>
      {message ? <p className="mt-2 text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
