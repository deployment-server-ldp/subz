"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitVerification } from "@/modules/verification/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Textarea } from "@/components/ui/Field";

export function SubmitVerificationForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitVerification({ additionalNotes: notes });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        We&rsquo;ll review the family and personal information already on your profile. Add
        anything else that could help a reviewer confirm your identity as a Subzwari — no
        government documents required.
      </p>
      <FormField label="Additional notes (optional)" htmlFor="notes">
        <Textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </FormField>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Submitting…" : "Submit for verification"}
      </Button>
    </form>
  );
}
