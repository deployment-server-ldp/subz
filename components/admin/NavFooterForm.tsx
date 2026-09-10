"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createNavItem, createFooterItem } from "@/modules/cms/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Field";

export function NavItemForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", href: "", displayOrder: 0 });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await createNavItem(form);
          if (!result.success) {
            setError(result.error);
            return;
          }
          setForm({ label: "", href: "", displayOrder: 0 });
          router.refresh();
        });
      }}
      className="flex flex-wrap items-end gap-4 rounded border border-border p-4"
    >
      <FormField label="Label" htmlFor="navLabel">
        <Input id="navLabel" required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
      </FormField>
      <FormField label="Link (href)" htmlFor="navHref">
        <Input id="navHref" required value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} />
      </FormField>
      <FormField label="Order" htmlFor="navOrder">
        <Input id="navOrder" type="number" className="w-20" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
      </FormField>
      <Button type="submit" size="sm" disabled={isPending}>
        Add
      </Button>
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </form>
  );
}

export function FooterItemForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ section: "", label: "", href: "", displayOrder: 0 });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await createFooterItem(form);
          if (!result.success) {
            setError(result.error);
            return;
          }
          setForm({ section: "", label: "", href: "", displayOrder: 0 });
          router.refresh();
        });
      }}
      className="flex flex-wrap items-end gap-4 rounded border border-border p-4"
    >
      <FormField label="Section" htmlFor="footerSection">
        <Input id="footerSection" required value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
      </FormField>
      <FormField label="Label" htmlFor="footerLabel">
        <Input id="footerLabel" required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
      </FormField>
      <FormField label="Link (href)" htmlFor="footerHref">
        <Input id="footerHref" required value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} />
      </FormField>
      <FormField label="Order" htmlFor="footerOrder">
        <Input id="footerOrder" type="number" className="w-20" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
      </FormField>
      <Button type="submit" size="sm" disabled={isPending}>
        Add
      </Button>
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
