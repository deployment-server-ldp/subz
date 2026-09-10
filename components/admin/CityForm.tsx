"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCity } from "@/modules/geography/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select } from "@/components/ui/Field";

export function CityForm({ countries }: { countries: { id: string; name: string }[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", countryId: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createCity(form);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setForm({ name: "", countryId: form.countryId });
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
      <FormField label="City name" htmlFor="cityName">
        <Input id="cityName" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </FormField>
      <FormField label="Country" htmlFor="cityCountry">
        <Select id="cityCountry" required value={form.countryId} onChange={(e) => setForm({ ...form, countryId: e.target.value })}>
          <option value="">Select country</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </FormField>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding…" : "Add city"}
      </Button>
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
