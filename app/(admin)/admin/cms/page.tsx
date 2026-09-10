import Link from "next/link";
import { Card } from "@/components/ui/Card";

const LINKS = [
  { href: "/admin/cms/pages", label: "Pages", description: "About, History, Privacy, Terms, Community Guidelines, Verification" },
  { href: "/admin/cms/navigation", label: "Navigation", description: "Manage main site navigation links" },
  { href: "/admin/cms/footer", label: "Footer", description: "Manage footer sections and links" },
];

export default function AdminCmsIndexPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Content Management</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full hover:border-accent">
              <p className="font-medium">{link.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
