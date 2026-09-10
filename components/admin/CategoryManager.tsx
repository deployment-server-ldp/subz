"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Field";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { ActionResult } from "@/modules/identity/actions";

export function CategoryManager({
  categories,
  createAction,
  deleteAction,
  showDisplayOrder = true,
}: {
  categories: { id: string; name: string; description: string | null; displayOrder?: number }[];
  createAction: (input: { name: string; description: string; displayOrder: number }) => Promise<ActionResult>;
  deleteAction: (id: string) => Promise<ActionResult>;
  showDisplayOrder?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", displayOrder: 0 });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createAction(form);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setForm({ name: "", description: "", displayOrder: 0 });
      router.refresh();
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4 rounded border border-border p-4">
        <FormField label="Name" htmlFor="catName">
          <Input id="catName" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </FormField>
        <FormField label="Description (optional)" htmlFor="catDescription">
          <Input id="catDescription" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </FormField>
        {showDisplayOrder ? (
          <FormField label="Order" htmlFor="catOrder">
            <Input
              id="catOrder"
              type="number"
              className="w-20"
              value={form.displayOrder}
              onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
            />
          </FormField>
        ) : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding…" : "Add category"}
        </Button>
        {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
      </form>

      <div className="mt-6">
        {categories.length === 0 ? (
          <EmptyState title="No categories yet" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Description</Th>
                <Th />
              </Tr>
            </Thead>
            <tbody>
              {categories.map((category) => (
                <Tr key={category.id}>
                  <Td>{category.name}</Td>
                  <Td>{category.description ?? "—"}</Td>
                  <Td>
                    <DeleteButton action={deleteAction.bind(null, category.id)} confirmText="Delete this category?" />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
