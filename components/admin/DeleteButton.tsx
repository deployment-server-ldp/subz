"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { ActionResult } from "@/modules/identity/actions";

export function DeleteButton({
  action,
  confirmText = "Are you sure? This cannot be undone.",
  redirectTo,
}: {
  action: () => Promise<ActionResult>;
  confirmText?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!window.confirm(confirmText)) return;
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    });
  }

  return (
    <div>
      <Button variant="danger" size="sm" onClick={handleClick} disabled={isPending}>
        {isPending ? "Deleting…" : "Delete"}
      </Button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
