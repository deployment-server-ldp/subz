"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { requestLoginOtp } from "@/modules/identity/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Field";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [mode, setMode] = useState<"password" | "code">("password");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", code: "" });

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.error) {
        setError("Incorrect email or password.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    });
  }

  function handleRequestCode() {
    setError(null);
    startTransition(async () => {
      await requestLoginOtp({ email: form.email });
      setCodeSent(true);
    });
  }

  function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signIn("otp", { email: form.email, code: form.code, redirect: false });
      if (result?.error) {
        setError("That code is invalid or has expired.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    });
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Sign in</h1>
      {searchParams.get("verified") ? (
        <p className="mt-1 text-sm text-emerald-700">Email verified — you can now sign in.</p>
      ) : null}

      <div className="mt-4 flex gap-2 text-sm">
        <button
          className={mode === "password" ? "font-medium text-accent" : "text-muted-foreground"}
          onClick={() => setMode("password")}
        >
          Password
        </button>
        <span className="text-muted-foreground">·</span>
        <button
          className={mode === "code" ? "font-medium text-accent" : "text-muted-foreground"}
          onClick={() => setMode("code")}
        >
          Email code
        </button>
      </div>

      {mode === "password" ? (
        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
          <FormField label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FormField>
          <FormField label="Password" htmlFor="password">
            <Input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </FormField>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-right text-sm">
            <Link href="/forgot-password" className="text-accent hover:underline">
              Forgot password?
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleCodeSubmit} className="mt-6 space-y-4">
          <FormField label="Email" htmlFor="email-otp">
            <Input
              id="email-otp"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FormField>
          {codeSent ? (
            <FormField label="Verification code" htmlFor="code">
              <Input
                id="code"
                required
                inputMode="numeric"
                maxLength={6}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </FormField>
          ) : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {!codeSent ? (
            <Button type="button" className="w-full" onClick={handleRequestCode} disabled={isPending || !form.email}>
              {isPending ? "Sending…" : "Send code"}
            </Button>
          ) : (
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in…" : "Sign in"}
            </Button>
          )}
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to SUBZWARI Global?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Join the community
        </Link>
      </p>
    </div>
  );
}
