"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import type { ActionResult } from "@/modules/identity/actions";

export async function markNotificationRead(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.recipientId !== session.user.id) {
    return { success: false, error: "Notification not found." };
  }

  await prisma.notification.update({ where: { id }, data: { read: true } });
  revalidatePath("/notifications");
  return { success: true };
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const session = await requireSession();
  await prisma.notification.updateMany({ where: { recipientId: session.user.id, read: false }, data: { read: true } });
  revalidatePath("/notifications");
  return { success: true };
}
