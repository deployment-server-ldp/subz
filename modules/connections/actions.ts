"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { notify } from "@/lib/notifications";
import { sendEmail } from "@/lib/email";
import { connectionRequestEmail } from "@/lib/email/templates";
import {
  sendConnectionRequestSchema,
  respondConnectionSchema,
  sendContactRequestSchema,
} from "@/lib/validation/connections";
import type { ActionResult } from "@/modules/identity/actions";

async function getOwnProfile(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Profile not found.");
  return profile;
}

export async function sendConnectionRequest(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = sendConnectionRequestSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid request." };

  const me = await getOwnProfile(session.user.id);
  if (me.id === parsed.data.toProfileId) return { success: false, error: "You can't connect with yourself." };

  const recipient = await prisma.profile.findUnique({
    where: { id: parsed.data.toProfileId },
    include: { user: true },
  });
  if (!recipient) return { success: false, error: "Member not found." };

  const existing = await prisma.connection.findFirst({
    where: {
      OR: [
        { requesterId: me.id, recipientId: recipient.id },
        { requesterId: recipient.id, recipientId: me.id },
      ],
      status: { in: ["PENDING", "ACCEPTED"] },
    },
  });
  if (existing) return { success: false, error: "A connection already exists or is pending." };

  await prisma.connection.create({ data: { requesterId: me.id, recipientId: recipient.id } });

  await notify({ recipientId: recipient.userId, type: "CONNECTION_REQUEST", link: "/network/requests" });
  await sendEmail(connectionRequestEmail(recipient.user.email, `${me.firstName} ${me.lastName}`));

  revalidatePath(`/members/${recipient.slug}`);
  return { success: true };
}

export async function respondToConnectionRequest(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = respondConnectionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid request." };

  const me = await getOwnProfile(session.user.id);
  const connection = await prisma.connection.findUnique({
    where: { id: parsed.data.connectionId },
    include: { requester: { include: { user: true } } },
  });
  if (!connection || connection.recipientId !== me.id) {
    return { success: false, error: "Connection request not found." };
  }
  if (connection.status !== "PENDING") return { success: false, error: "This request has already been handled." };

  await prisma.connection.update({
    where: { id: connection.id },
    data: { status: parsed.data.accept ? "ACCEPTED" : "REJECTED", respondedAt: new Date() },
  });

  if (parsed.data.accept) {
    await notify({
      recipientId: connection.requester.userId,
      type: "CONNECTION_ACCEPTED",
      link: `/members/${me.slug}`,
    });
  }

  revalidatePath("/network/requests");
  revalidatePath("/network/connections");
  return { success: true };
}

export async function removeConnection(connectionId: string): Promise<ActionResult> {
  const session = await requireSession();
  const me = await getOwnProfile(session.user.id);

  const connection = await prisma.connection.findUnique({ where: { id: connectionId } });
  if (!connection || (connection.requesterId !== me.id && connection.recipientId !== me.id)) {
    return { success: false, error: "Connection not found." };
  }

  await prisma.connection.update({ where: { id: connectionId }, data: { status: "REMOVED" } });
  revalidatePath("/network/connections");
  return { success: true };
}

export async function sendContactRequest(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = sendContactRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const me = await getOwnProfile(session.user.id);
  const recipient = await prisma.profile.findUnique({ where: { id: parsed.data.toProfileId } });
  if (!recipient) return { success: false, error: "Member not found." };

  await prisma.contactRequest.create({
    data: { fromId: me.id, toId: recipient.id, message: parsed.data.message },
  });

  return { success: true };
}
