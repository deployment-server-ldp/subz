import Link from "next/link";
import { SignOutButton } from "./SignOutButton";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/verification", label: "Verification" },
  { href: "/dashboard/businesses", label: "My Businesses" },
  { href: "/dashboard/events", label: "My Events" },
  { href: "/dashboard/support", label: "Community Support" },
  { href: "/network", label: "Discover" },
  { href: "/network/connections", label: "Connections" },
  { href: "/network/requests", label: "Requests" },
  { href: "/notifications", label: "Notifications" },
  { href: "/settings", label: "Settings" },
];

export function MemberShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl">
      <aside className="hidden w-56 shrink-0 border-r border-border p-6 md:block">
        <Link href="/" className="font-display text-lg font-semibold">
          SUBZWARI GLOBAL
        </Link>
        <nav className="mt-8 flex flex-col gap-1 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="rounded px-3 py-2 hover:bg-muted">
              {item.label}
            </Link>
          ))}
        </nav>
        <SignOutButton className="mt-8 px-3 text-sm text-muted-foreground hover:text-foreground" />
      </aside>
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
