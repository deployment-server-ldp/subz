"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createStory, updateStory } from "@/modules/stories/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";

const TYPES = ["MEMBER", "FAMILY", "HERITAGE", "HISTORY", "ACHIEVEMENT", "PROFESSIONAL_JOURNEY", "COMMUNITY", "GLOBAL"];
const STATUSES = ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "SCHEDULED", "REJECTED", "ARCHIVED"];

export function StoryForm({
  storyId,
  categories,
  initial,
}: {
  storyId?: string;
  categories: { id: string; name: string }[];
  initial?: {
    title: string;
    excerpt: string;
    body: string;
    type: string;
    categoryId: string;
    tags: string;
    status: string;
    scheduledAt: string;
    featured: boolean;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(
    initial ?? {
      title: "",
      excerpt: "",
      body: "",
      type: "COMMUNITY",
      categoryId: "",
      tags: "",
      status: "DRAFT",
      scheduledAt: "",
      featured: false,
    },
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = storyId ? await updateStory(storyId, form) : await createStory(form);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/admin/stories");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <FormField label="Title" htmlFor="title">
        <Input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </FormField>
      <FormField label="Excerpt" htmlFor="excerpt">
        <Input id="excerpt" maxLength={300} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
      </FormField>
      <FormField label="Body" htmlFor="body">
        <Textarea id="body" required rows={10} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Type" htmlFor="type">
          <Select id="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replaceAll("_", " ")}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Category" htmlFor="categoryId">
          <Select id="categoryId" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      <FormField label="Tags (comma-separated)" htmlFor="tags">
        <Input id="tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Status" htmlFor="status">
          <Select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </Select>
        </FormField>
        {form.status === "SCHEDULED" ? (
          <FormField label="Scheduled at" htmlFor="scheduledAt">
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            />
          </FormField>
        ) : null}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
        Feature on homepage
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : storyId ? "Save changes" : "Create story"}
      </Button>
    </form>
  );
}
