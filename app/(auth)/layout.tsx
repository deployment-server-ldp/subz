import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-6 py-16">
      <Link href="/" className="mb-8 font-display text-xl font-semibold">
        SUBZWARI GLOBAL
      </Link>
      <div className="w-full max-w-md rounded border border-border bg-surface p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
