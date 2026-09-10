import { HTMLAttributes } from "react";
import { BadgeCheck } from "lucide-react";
import { cn } from "./cn";

type Tone = "neutral" | "accent" | "success" | "warning" | "danger" | "badge";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  accent: "bg-accent/10 text-accent",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  badge: "bg-badge/15 text-badge",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

/** The one recognizable verification trust signal reused everywhere (ARCHITECTURE.md §L). */
export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <Badge tone="badge" className={className}>
      <BadgeCheck className="h-3.5 w-3.5" />
      Verified
    </Badge>
  );
}
