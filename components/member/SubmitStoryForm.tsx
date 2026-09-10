"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitStory } from "@/modules/stories/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";

const TYPES = ["MEMBER", "FAMILY", "HERITAGE", "HISTORY", "ACHIEVEMENT", "PROFESSIONAL_JOURNEY", "COMMUNITY", "GLOBAL"];

export function SubmitStoryForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", excerpt: "", body: "", type: "MEMBER" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitStory(form);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/dashboard");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <FormField label="Title" htmlFor="title">
        <Input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </FormField>
      <FormField label="Type" htmlFor="type">
        <Select id="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replaceAll("_", " ")}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Short excerpt (optional)" htmlFor="excerpt">
        <Input id="excerpt" maxLength={300} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
      </FormField>
      <FormField label="Your story" htmlFor="body">
        <Textarea id="body" required rows={10} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
      </FormField>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Submitting…" : "Submit for review"}
      </Button>
    </form>
  );
}
