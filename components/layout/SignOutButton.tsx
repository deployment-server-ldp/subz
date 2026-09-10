"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <button className={className} onClick={() => signOut({ callbackUrl: "/" })}>
      Sign out
    </button>
  );
}
