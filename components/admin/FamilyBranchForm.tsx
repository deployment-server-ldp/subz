"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createFamilyBranch, updateFamilyBranch } from "@/modules/family/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Field";

export function FamilyBranchForm({
  branchId,
  initial,
}: {
  branchId?: string;
  initial?: { name: string; description: string; region: string; historicalInformation: string };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initial ?? { name: "", description: "", region: "", historicalInformation: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = branchId ? await updateFamilyBranch(branchId, form) : await createFamilyBranch(form);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/admin/family-branches");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <FormField label="Branch name" htmlFor="name">
        <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </FormField>
      <FormField label="Region" htmlFor="region">
        <Input id="region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
      </FormField>
      <FormField label="Description" htmlFor="description">
        <Textarea id="description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </FormField>
      <FormField label="Historical information" htmlFor="historicalInformation">
        <Textarea
          id="historicalInformation"
          rows={4}
          value={form.historicalInformation}
          onChange={(e) => setForm({ ...form, historicalInformation: e.target.value })}
        />
      </FormField>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : branchId ? "Save changes" : "Create branch"}
      </Button>
    </form>
  );
}
