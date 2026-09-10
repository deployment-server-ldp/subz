import "server-only";
import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

/** Creates an in-app notification. Call this from every module event listed in ARCHITECTURE.md §21. */
export async function notify(params: {
  recipientId: string;
  type: NotificationType;
  link?: string;
  payload?: Record<string, unknown>;
}) {
  await prisma.notification.create({
    data: {
      recipientId: params.recipientId,
      type: params.type,
      link: params.link,
      payload: params.payload as any,
    },
  });
}
