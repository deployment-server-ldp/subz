"use client";

import { useState, useTransition } from "react";
import { sendConnectionRequest, sendContactRequest } from "@/modules/connections/actions";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";

export function ProfileActions({ profileId }: { profileId: string }) {
  const [isPending, startTransition] = useTransition();
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleConnect() {
    setFeedback(null);
    startTransition(async () => {
      const result = await sendConnectionRequest({ toProfileId: profileId });
      setFeedback(result.success ? "Connection request sent." : result.error);
    });
  }

  function handleContact(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const result = await sendContactRequest({ toProfileId: profileId, message });
      if (result.success) {
        setFeedback("Your message has been sent.");
        setShowContactForm(false);
        setMessage("");
      } else {
        setFeedback(result.error);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleConnect} disabled={isPending}>
          Connect
        </Button>
        <Button variant="secondary" onClick={() => setShowContactForm((v) => !v)}>
          Request Introduction
        </Button>
      </div>
      {showContactForm ? (
        <form onSubmit={handleContact} className="space-y-2">
          <Textarea
            required
            placeholder="Introduce yourself…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Sending…" : "Send"}
          </Button>
        </form>
      ) : null}
      {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}
    </div>
  );
}
