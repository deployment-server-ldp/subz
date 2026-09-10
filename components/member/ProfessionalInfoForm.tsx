"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfessionalInfo } from "@/modules/profile/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Field";

type Category = { id: string; name: string };

export function ProfessionalInfoForm({
  initial,
  categories,
}: {
  initial: {
    profession: string;
    jobTitle: string;
    company: string;
    industry: string;
    skills: string;
    education: string;
    university: string;
    linkedinUrl: string;
    websiteUrl: string;
    categoryIds: string[];
  };
  categories: Category[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [form, setForm] = useState(initial);

  function toggleCategory(id: string) {
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id) ? f.categoryIds.filter((c) => c !== id) : [...f.categoryIds, id],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await updateProfessionalInfo({
        ...form,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      if (!result.success) {
        setMessage({ type: "error", text: result.error });
        return;
      }
      setMessage({ type: "success", text: "Saved." });
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Profession" htmlFor="profession">
          <Input id="profession" value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} />
        </FormField>
        <FormField label="Job title" htmlFor="jobTitle">
          <Input id="jobTitle" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Company" htmlFor="company">
          <Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        </FormField>
        <FormField label="Industry" htmlFor="industry">
          <Input id="industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
        </FormField>
      </div>

      <FormField label="Skills (comma-separated)" htmlFor="skills">
        <Input id="skills" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
      </FormField>

      <div>
        <p className="mb-2 text-sm font-medium">Professional categories</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => toggleCategory(c.id)}
              className={`rounded-full border px-3 py-1 text-xs ${
                form.categoryIds.includes(c.id) ? "border-accent bg-accent/10 text-accent" : "border-border"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Education" htmlFor="education">
          <Input id="education" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
        </FormField>
        <FormField label="University" htmlFor="university">
          <Input id="university" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="LinkedIn URL" htmlFor="linkedinUrl">
          <Input id="linkedinUrl" value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} />
        </FormField>
        <FormField label="Personal website" htmlFor="websiteUrl">
          <Input id="websiteUrl" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
        </FormField>
      </div>

      {message ? (
        <p className={`text-sm ${message.type === "error" ? "text-red-600" : "text-emerald-700"}`}>{message.text}</p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
