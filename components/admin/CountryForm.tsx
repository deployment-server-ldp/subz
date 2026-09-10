"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCountry, updateCountry } from "@/modules/geography/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Field";

export function CountryForm({
  countryId,
  initial,
}: {
  countryId?: string;
  initial?: { name: string; isoCode: string; summary: string; displayOrder: number };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initial ?? { name: "", isoCode: "", summary: "", displayOrder: 0 });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = countryId ? await updateCountry(countryId, form) : await createCountry(form);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/admin/countries");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <FormField label="Country name" htmlFor="name">
        <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </FormField>
      <FormField label="ISO code (optional)" htmlFor="isoCode">
        <Input id="isoCode" maxLength={3} value={form.isoCode} onChange={(e) => setForm({ ...form, isoCode: e.target.value })} />
      </FormField>
      <FormField label="Summary (optional)" htmlFor="summary">
        <Textarea id="summary" rows={3} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
      </FormField>
      <FormField label="Display order" htmlFor="displayOrder">
        <Input
          id="displayOrder"
          type="number"
          value={form.displayOrder}
          onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
        />
      </FormField>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : countryId ? "Save changes" : "Create country"}
      </Button>
    </form>
  );
}
