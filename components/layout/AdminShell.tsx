import Link from "next/link";
import { SignOutButton } from "./SignOutButton";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/verification", label: "Verification" },
  { href: "/admin/family-branches", label: "Family Branches" },
  { href: "/admin/countries", label: "Countries" },
  { href: "/admin/cities", label: "Cities" },
  { href: "/admin/professional-categories", label: "Professional Categories" },
  { href: "/admin/businesses", label: "Businesses" },
  { href: "/admin/business-categories", label: "Business Categories" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/stories", label: "Stories" },
  { href: "/admin/story-categories", label: "Story Categories" },
  { href: "/admin/moments", label: "Moments" },
  { href: "/admin/support-requests", label: "Support Requests" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/admins", label: "Admins" },
  { href: "/admin/roles-permissions", label: "Roles & Permissions" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/cms", label: "CMS" },
  { href: "/admin/audit-logs", label: "Audit Logs" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl">
      <aside className="hidden w-60 shrink-0 overflow-y-auto border-r border-border p-6 md:block">
        <Link href="/" className="font-display text-lg font-semibold">
          SUBZWARI ADMIN
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
