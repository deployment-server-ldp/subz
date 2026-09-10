"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/modules/identity/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Field";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: searchParams.get("email") ?? "",
    code: "",
    password: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await resetPassword(form);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/login?reset=1");
    });
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Set a new password</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </FormField>
        <FormField label="Reset code" htmlFor="code">
          <Input
            id="code"
            required
            inputMode="numeric"
            maxLength={6}
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
        </FormField>
        <FormField label="New password" htmlFor="password">
          <Input
            id="password"
            type="password"
            required
            minLength={10}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </FormField>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Saving…" : "Reset password"}
        </Button>
      </form>
    </div>
  );
}
