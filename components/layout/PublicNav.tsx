import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";
import { ButtonLink } from "@/components/ui/Button";
import { SignOutButton } from "./SignOutButton";

const LINKS = [
  { href: "/community", label: "Community" },
  { href: "/members", label: "Members" },
  { href: "/professionals", label: "Professionals" },
  { href: "/businesses", label: "Businesses" },
  { href: "/countries", label: "Countries" },
  { href: "/stories", label: "Stories" },
  { href: "/events", label: "Events" },
];

export async function PublicNav() {
  const session = await getCurrentSession();

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-semibold">
          SUBZWARI GLOBAL
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-accent">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <ButtonLink href="/dashboard" variant="secondary" size="sm">
                Dashboard
              </ButtonLink>
              <SignOutButton className="text-sm text-muted-foreground hover:text-foreground" />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm hover:text-accent">
                Sign in
              </Link>
              <ButtonLink href="/register" size="sm">
                Join
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
