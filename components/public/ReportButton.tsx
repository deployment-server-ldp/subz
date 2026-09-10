"use client";

import { useState, useTransition } from "react";
import { submitReport } from "@/modules/reports/actions";
import { Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const REASONS = [
  "FAKE_PROFILE",
  "INCORRECT_INFORMATION",
  "HARASSMENT",
  "SPAM",
  "INAPPROPRIATE_CONTENT",
  "PRIVACY_CONCERN",
  "OTHER",
];

export function ReportButton({
  targetType,
  targetId,
}: {
  targetType: "PROFILE" | "BUSINESS" | "STORY" | "MOMENT" | "EVENT" | "SUPPORT_REQUEST";
  targetId: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [form, setForm] = useState({ reason: "OTHER", details: "" });

  if (feedback) {
    return <p className="text-xs text-muted-foreground">{feedback}</p>;
  }

  if (!open) {
    return (
      <button className="text-xs text-muted-foreground underline hover:text-foreground" onClick={() => setOpen(true)}>
        Report
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await submitReport({ targetType, targetId, ...form });
          setFeedback(result.success ? "Thanks — our team will review this." : result.error);
        });
      }}
      className="space-y-2 rounded border border-border p-3"
    >
      <Select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>
        {REASONS.map((r) => (
          <option key={r} value={r}>
            {r.replaceAll("_", " ")}
          </option>
        ))}
      </Select>
      <Textarea
        rows={2}
        placeholder="Additional details (optional)"
        value={form.details}
        onChange={(e) => setForm({ ...form, details: e.target.value })}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Sending…" : "Submit report"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
