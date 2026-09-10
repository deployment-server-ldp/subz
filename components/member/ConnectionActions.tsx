"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { respondToConnectionRequest, removeConnection } from "@/modules/connections/actions";
import { Button } from "@/components/ui/Button";

export function RespondConnectionButtons({ connectionId }: { connectionId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function respond(accept: boolean) {
    startTransition(async () => {
      await respondToConnectionRequest({ connectionId, accept });
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => respond(true)} disabled={isPending}>
        Accept
      </Button>
      <Button size="sm" variant="secondary" onClick={() => respond(false)} disabled={isPending}>
        Decline
      </Button>
    </div>
  );
}

export function RemoveConnectionButton({ connectionId }: { connectionId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await removeConnection(connectionId);
          router.refresh();
        })
      }
    >
      Remove
    </Button>
  );
}
