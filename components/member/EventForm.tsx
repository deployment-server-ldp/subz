"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { proposeEvent } from "@/modules/events/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";

export function EventForm({ countries }: { countries: { id: string; name: string }[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    startsAt: "",
    endsAt: "",
    location: "",
    countryId: "",
    maxCapacity: "",
    requiresRsvp: true,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await proposeEvent(form);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/dashboard/events");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <FormField label="Event name" htmlFor="name">
        <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </FormField>
      <FormField label="Description" htmlFor="description">
        <Textarea id="description" required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Starts at" htmlFor="startsAt">
          <Input id="startsAt" type="datetime-local" required value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
        </FormField>
        <FormField label="Ends at (optional)" htmlFor="endsAt">
          <Input id="endsAt" type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
        </FormField>
      </div>
      <FormField label="Location" htmlFor="location">
        <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Country" htmlFor="countryId">
          <Select id="countryId" value={form.countryId} onChange={(e) => setForm({ ...form, countryId: e.target.value })}>
            <option value="">Select country</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Max capacity (optional)" htmlFor="maxCapacity">
          <Input id="maxCapacity" type="number" value={form.maxCapacity} onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })} />
        </FormField>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Submitting…" : "Submit for approval"}
      </Button>
    </form>
  );
}
