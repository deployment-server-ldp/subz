"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitBusiness } from "@/modules/business/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";

export function BusinessForm({
  categories,
  countries,
}: {
  categories: { id: string; name: string }[];
  countries: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    countryId: "",
    website: "",
    description: "",
    contactMethod: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitBusiness(form);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/dashboard/businesses");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <FormField label="Business name" htmlFor="name">
        <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Category" htmlFor="categoryId">
          <Select id="categoryId" required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Country" htmlFor="countryId">
          <Select id="countryId" required value={form.countryId} onChange={(e) => setForm({ ...form, countryId: e.target.value })}>
            <option value="">Select country</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      <FormField label="Website (optional)" htmlFor="website">
        <Input id="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
      </FormField>
      <FormField label="Description" htmlFor="description">
        <Textarea id="description" required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </FormField>
      <FormField label="Contact method (optional)" htmlFor="contactMethod">
        <Input id="contactMethod" placeholder="Email or phone" value={form.contactMethod} onChange={(e) => setForm({ ...form, contactMethod: e.target.value })} />
      </FormField>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Submitting…" : "Submit for review"}
      </Button>
    </form>
  );
}
