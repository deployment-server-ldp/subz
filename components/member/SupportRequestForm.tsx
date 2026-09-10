"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitSupportRequest } from "@/modules/support/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";

const CATEGORIES = [
  "CAREER_GUIDANCE",
  "PROFESSIONAL_ADVICE",
  "MENTORSHIP",
  "RELOCATION_GUIDANCE",
  "BUSINESS_INTRODUCTION",
  "EDUCATION_GUIDANCE",
  "GENERAL_ASSISTANCE",
];

export function SupportRequestForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    category: "GENERAL_ASSISTANCE",
    title: "",
    description: "",
    urgency: "MEDIUM",
    visibility: "COMMUNITY",
    contactPreference: "PLATFORM_MESSAGE",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitSupportRequest(form);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/dashboard/support");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <FormField label="Category" htmlFor="category">
        <Select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replaceAll("_", " ")}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Title" htmlFor="title">
        <Input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </FormField>
      <FormField label="Description" htmlFor="description">
        <Textarea id="description" required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Urgency" htmlFor="urgency">
          <Select id="urgency" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </Select>
        </FormField>
        <FormField label="Visibility" htmlFor="visibility">
          <Select id="visibility" value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
            <option value="COMMUNITY">Community</option>
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private (admin only)</option>
          </Select>
        </FormField>
      </div>
      <FormField label="Preferred contact method" htmlFor="contactPreference">
        <Select id="contactPreference" value={form.contactPreference} onChange={(e) => setForm({ ...form, contactPreference: e.target.value })}>
          <option value="PLATFORM_MESSAGE">Platform message</option>
          <option value="EMAIL">Email</option>
          <option value="EITHER">Either</option>
        </Select>
      </FormField>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Submitting…" : "Submit request"}
      </Button>
    </form>
  );
}
