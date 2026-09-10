"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmailCode, resendVerificationCode } from "@/modules/identity/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Field";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await verifyEmailCode({ email, code });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/login?verified=1");
    });
  }

  function handleResend() {
    setError(null);
    setResent(false);
    startTransition(async () => {
      await resendVerificationCode({ email });
      setResent(true);
    });
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Verify your email</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter the 6-digit code we sent to your email address.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormField label="Email" htmlFor="email">
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <FormField label="Verification code" htmlFor="code">
          <Input
            id="code"
            required
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </FormField>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {resent ? <p className="text-sm text-emerald-700">A new code has been sent.</p> : null}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Verifying…" : "Verify email"}
        </Button>
        <button
          type="button"
          onClick={handleResend}
          disabled={isPending}
          className="w-full text-center text-sm text-accent hover:underline"
        >
          Resend code
        </button>
      </form>
    </div>
  );
}
