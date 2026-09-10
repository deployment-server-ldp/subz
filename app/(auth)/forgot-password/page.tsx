"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestPasswordReset } from "@/modules/identity/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Field";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await requestPasswordReset({ email });
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          If an account exists for {email}, we&rsquo;ve sent a reset code to it.
        </p>
        <Button className="mt-6 w-full" onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}>
          I have a code
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Reset your password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your email and we&rsquo;ll send you a reset code.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormField label="Email" htmlFor="email">
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Sending…" : "Send reset code"}
        </Button>
      </form>
    </div>
  );
}
