"use client";

import { useTransition } from "react";
import { signOut } from "next-auth/react";
import { deactivateAccount } from "@/modules/identity/actions";
import { Button } from "@/components/ui/Button";

export function DeactivateAccountButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Deactivate your account? You can contact support to reactivate it later.")) return;
    startTransition(async () => {
      await deactivateAccount();
      await signOut({ callbackUrl: "/" });
    });
  }

  return (
    <Button variant="danger" size="sm" onClick={handleClick} disabled={isPending}>
      {isPending ? "Deactivating…" : "Deactivate my account"}
    </Button>
  );
}
