import Link from "next/link";
import { cn } from "./cn";

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center gap-1 pt-6" aria-label="Pagination">
      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "rounded px-3 py-1.5 text-sm",
            p === page ? "bg-accent text-accent-foreground" : "hover:bg-muted",
          )}
        >
          {p}
        </Link>
      ))}
    </nav>
  );
}
