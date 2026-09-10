import Link from "next/link";
import { cn } from "@/components/ui/cn";

const TABS = [
  { key: "personal", href: "/dashboard/profile", label: "Personal" },
  { key: "professional", href: "/dashboard/profile/professional", label: "Professional" },
  { key: "family", href: "/dashboard/profile/family", label: "Family" },
  { key: "privacy", href: "/dashboard/profile/privacy", label: "Privacy" },
];

export function ProfileTabs({ active }: { active: string }) {
  return (
    <div className="mt-4 flex gap-4 border-b border-border text-sm">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={cn(
            "border-b-2 pb-2",
            active === tab.key ? "border-accent font-medium text-accent" : "border-transparent text-muted-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
