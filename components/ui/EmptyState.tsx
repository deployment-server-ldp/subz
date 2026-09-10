import type { LucideIcon } from "lucide-react";
import { cn } from "./cn";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2 rounded border border-dashed border-border py-16 text-center", className)}>
      {Icon ? <Icon className="h-8 w-8 text-muted-foreground" /> : null}
      <p className="font-medium">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}
