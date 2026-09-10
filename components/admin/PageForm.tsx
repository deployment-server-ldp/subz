"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertPage } from "@/modules/cms/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";

export function PageForm({
  pageId,
  initial,
}: {
  pageId?: string;
  initial?: { title: string; slug: string; body: string; status: "DRAFT" | "PUBLISHED" };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initial ?? { title: "", slug: "", body: "", status: "DRAFT" as const });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await upsertPage(pageId, form);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/admin/cms/pages");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <FormField label="Title" htmlFor="title">
        <Input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </FormField>
      <FormField label="Slug (URL path, e.g. about)" htmlFor="slug">
        <Input id="slug" required disabled={!!pageId} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
      </FormField>
      <FormField label="Content" htmlFor="body">
        <Textarea id="body" required rows={12} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
      </FormField>
      <FormField label="Status" htmlFor="status">
        <Select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </Select>
      </FormField>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : pageId ? "Save changes" : "Create page"}
      </Button>
    </form>
  );
}
