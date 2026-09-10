"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { requirePermission, PERMISSIONS } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { notify } from "@/lib/notifications";
import { slugify, uniqueSlug } from "@/lib/slug";
import { eventSchema } from "@/lib/validation/events";
import type { ActionResult } from "@/modules/identity/actions";
import type { EventStatus, RsvpStatus } from "@prisma/client";

export async function proposeEvent(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { success: false, error: "Profile not found." };

  const data = parsed.data;
  const baseSlug = slugify(data.name);
  const slugTaken = await prisma.event.findUnique({ where: { slug: baseSlug } });
  const slug = slugTaken ? uniqueSlug(data.name) : baseSlug;

  await prisma.event.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      startsAt: new Date(data.startsAt),
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      location: data.location || null,
      countryId: data.countryId || null,
      cityId: data.cityId || null,
      maxCapacity: data.maxCapacity,
      requiresRsvp: data.requiresRsvp,
      organizerId: profile.id,
      status: "PENDING_APPROVAL",
    },
  });

  revalidatePath("/dashboard/events");
  return { success: true };
}

export async function reviewEvent(input: { id: string; status: "APPROVED" | "REJECTED" | "SUSPENDED" }): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_EVENTS);

  const newStatus: EventStatus = input.status === "APPROVED" ? "PUBLISHED" : "CANCELLED";

  const event = await prisma.event.update({
    where: { id: input.id },
    data: { status: newStatus },
    include: { organizer: true },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: `event.${newStatus.toLowerCase()}`,
    targetType: "Event",
    targetId: event.id,
  });

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${event.id}`);
  revalidatePath("/events");
  return { success: true };
}

export async function rsvpToEvent(eventId: string, status: RsvpStatus): Promise<ActionResult> {
  const session = await requireSession();
  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { success: false, error: "Profile not found." };

  const event = await prisma.event.findUnique({ where: { id: eventId }, include: { _count: { select: { rsvps: { where: { status: "GOING" } } } } } });
  if (!event || event.status !== "PUBLISHED") return { success: false, error: "This event is not open for RSVPs." };

  if (status === "GOING" && event.maxCapacity && event._count.rsvps >= event.maxCapacity) {
    const existing = await prisma.eventAttendee.findUnique({
      where: { eventId_profileId: { eventId, profileId: profile.id } },
    });
    if (!existing || existing.status !== "GOING") {
      return { success: false, error: "This event has reached its capacity." };
    }
  }

  await prisma.eventAttendee.upsert({
    where: { eventId_profileId: { eventId, profileId: profile.id } },
    create: { eventId, profileId: profile.id, status },
    update: { status },
  });

  await notify({ recipientId: session.user.id, type: "EVENT_RSVP_CONFIRMED", link: `/events/${event.slug}` });

  revalidatePath(`/events/${event.slug}`);
  return { success: true };
}

export async function cancelEvent(eventId: string): Promise<ActionResult> {
  const session = await requireSession();
  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { success: false, error: "Profile not found." };

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.organizerId !== profile.id) return { success: false, error: "Event not found." };

  await prisma.event.update({ where: { id: eventId }, data: { status: "CANCELLED" } });
  revalidatePath("/dashboard/events");
  return { success: true };
}
