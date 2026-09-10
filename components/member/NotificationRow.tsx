"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markNotificationRead } from "@/modules/notifications/actions";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";

export function NotificationRow({
  id,
  label,
  link,
  read,
  createdAt,
}: {
  id: string;
  label: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleClick() {
    if (!read) {
      startTransition(async () => {
        await markNotificationRead(id);
        router.refresh();
      });
    }
  }

  const content = (
    <Card className={cn("flex items-center justify-between", !read && "border-accent bg-accent/5")} onClick={handleClick}>
      <div>
        <p className={cn("text-sm", !read && "font-medium")}>{label}</p>
        <p className="text-xs text-muted-foreground">{new Date(createdAt).toLocaleString()}</p>
      </div>
      {!read ? <span className="h-2 w-2 rounded-full bg-accent" /> : null}
    </Card>
  );

  return link ? <Link href={link}>{content}</Link> : content;
}
