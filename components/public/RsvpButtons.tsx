"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { rsvpToEvent } from "@/modules/events/actions";
import { Button } from "@/components/ui/Button";

export function RsvpButtons({ eventId, currentStatus }: { eventId: string; currentStatus?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function act(status: "GOING" | "INTERESTED" | "CANCELLED") {
    startTransition(async () => {
      await rsvpToEvent(eventId, status);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={isPending || currentStatus === "GOING"} onClick={() => act("GOING")}>
        {currentStatus === "GOING" ? "You're going" : "I'm going"}
      </Button>
      <Button size="sm" variant="secondary" disabled={isPending || currentStatus === "INTERESTED"} onClick={() => act("INTERESTED")}>
        Interested
      </Button>
      {currentStatus === "GOING" || currentStatus === "INTERESTED" ? (
        <Button size="sm" variant="ghost" disabled={isPending} onClick={() => act("CANCELLED")}>
          Cancel RSVP
        </Button>
      ) : null}
    </div>
  );
}
