"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCustomRole, assignRoleToUser } from "@/modules/roles/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select } from "@/components/ui/Field";

export function CreateRoleForm({ permissions }: { permissions: { key: string; name: string }[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(key: string) {
    setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await createCustomRole({ name, permissionKeys: selected });
          if (!result.success) {
            setError(result.error);
            return;
          }
          setName("");
          setSelected([]);
          router.refresh();
        });
      }}
      className="space-y-3 rounded border border-border p-4"
    >
      <FormField label="Role name" htmlFor="roleName">
        <Input id="roleName" required value={name} onChange={(e) => setName(e.target.value)} />
      </FormField>
      <div>
        <p className="mb-2 text-sm font-medium">Permissions</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {permissions.map((p) => (
            <label key={p.key} className="flex items-center gap-2">
              <input type="checkbox" checked={selected.includes(p.key)} onChange={() => toggle(p.key)} />
              {p.name}
            </label>
          ))}
        </div>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Creating…" : "Create role"}
      </Button>
    </form>
  );
}

export function AssignRoleForm({ roles }: { roles: { id: string; name: string }[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", roleId: roles[0]?.id ?? "" });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await assignRoleToUser(form);
          if (!result.success) {
            setError(result.error);
            return;
          }
          setForm({ email: "", roleId: roles[0]?.id ?? "" });
          router.refresh();
        });
      }}
      className="flex flex-wrap items-end gap-4 rounded border border-border p-4"
    >
      <FormField label="Member email" htmlFor="assignEmail">
        <Input id="assignEmail" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </FormField>
      <FormField label="Custom role" htmlFor="assignRole">
        <Select id="assignRole" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      </FormField>
      <Button type="submit" size="sm" disabled={isPending || roles.length === 0}>
        {isPending ? "Assigning…" : "Assign role"}
      </Button>
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
