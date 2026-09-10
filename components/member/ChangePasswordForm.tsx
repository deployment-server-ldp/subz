"use client";

import { useState, useTransition } from "react";
import { changePassword } from "@/modules/identity/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Field";

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await changePassword(form);
      if (!result.success) {
        setMessage({ type: "error", text: result.error });
        return;
      }
      setMessage({ type: "success", text: "Password updated." });
      setForm({ currentPassword: "", newPassword: "" });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <FormField label="Current password" htmlFor="currentPassword">
        <Input
          id="currentPassword"
          type="password"
          required
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
        />
      </FormField>
      <FormField label="New password" htmlFor="newPassword">
        <Input
          id="newPassword"
          type="password"
          required
          minLength={10}
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />
      </FormField>
      {message ? (
        <p className={`text-sm ${message.type === "error" ? "text-red-600" : "text-emerald-700"}`}>{message.text}</p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Change password"}
      </Button>
    </form>
  );
}
