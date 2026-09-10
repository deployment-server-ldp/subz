import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

const FALLBACK_SECTIONS: Record<string, { label: string; href: string }[]> = {
  Community: [
    { label: "About", href: "/about" },
    { label: "History", href: "/history" },
    { label: "Community Guidelines", href: "/community-guidelines" },
    { label: "Verification", href: "/verification" },
  ],
  Directory: [
    { label: "Members", href: "/members" },
    { label: "Professionals", href: "/professionals" },
    { label: "Businesses", href: "/businesses" },
    { label: "Countries", href: "/countries" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Contact", href: "/contact" },
  ],
};

export async function PublicFooter() {
  let items: { section: string; label: string; href: string }[] = [];
  try {
    items = await prisma.footerItem.findMany({
      where: { isVisible: true },
      orderBy: { displayOrder: "asc" },
    });
  } catch {
    // DB not reachable (e.g. during static build without a database) — fall
    // back to the default footer so the page still renders.
  }

  const sections =
    items.length > 0
      ? items.reduce<Record<string, { label: string; href: string }[]>>((acc, item) => {
          (acc[item.section] ??= []).push({ label: item.label, href: item.href });
          return acc;
        }, {})
      : FALLBACK_SECTIONS;

  return (
    <footer className="border-t border-border bg-muted">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="font-display text-lg font-semibold">SUBZWARI GLOBAL</p>
          <p className="mt-2 text-sm text-muted-foreground">SUBZWARI&rsquo;s ARE ONE</p>
        </div>
        {Object.entries(sections).map(([section, links]) => (
          <div key={section}>
            <p className="text-sm font-semibold">{section}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} SUBZWARI Global Network. One Name. One Community. One Network.
      </div>
    </footer>
  );
}
