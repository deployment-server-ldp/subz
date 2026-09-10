"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { offerHelp } from "@/modules/support/actions";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";

export function OfferHelpForm({ supportRequestId }: { supportRequestId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!open) {
    return (
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        Offer to Help
      </Button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await offerHelp({ supportRequestId, message });
          if (result.success) {
            setFeedback("Your offer has been sent.");
            setOpen(false);
          } else {
            setFeedback(result.error);
          }
          router.refresh();
        });
      }}
      className="space-y-2"
    >
      <Textarea required rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can you help?" />
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Sending…" : "Send offer"}
      </Button>
      {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}
    </form>
  );
}
