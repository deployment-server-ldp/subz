"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserSystemRole } from "@/modules/admins/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select } from "@/components/ui/Field";

const ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "VERIFICATION_MANAGER",
  "CONTENT_MANAGER",
  "REGIONAL_COORDINATOR",
  "MODERATOR",
  "MEMBER",
];

export function SetRoleForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", role: "MODERATOR" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await setUserSystemRole(form);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setForm({ email: "", role: "MODERATOR" });
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4 rounded border border-border p-4">
      <FormField label="Member email" htmlFor="email">
        <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </FormField>
      <FormField label="Role" htmlFor="role">
        <Select id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.replaceAll("_", " ")}
            </option>
          ))}
        </Select>
      </FormField>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Set role"}
      </Button>
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
