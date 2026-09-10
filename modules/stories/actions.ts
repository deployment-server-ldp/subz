"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { requirePermission, PERMISSIONS } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { notify } from "@/lib/notifications";
import { slugify, uniqueSlug } from "@/lib/slug";
import { submitStorySchema, editStorySchema } from "@/lib/validation/stories";
import type { ActionResult } from "@/modules/identity/actions";

export async function submitStory(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = submitStorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { success: false, error: "Profile not found." };

  const data = parsed.data;
  const baseSlug = slugify(data.title);
  const slugTaken = await prisma.story.findUnique({ where: { slug: baseSlug } });
  const slug = slugTaken ? uniqueSlug(data.title) : baseSlug;

  await prisma.story.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt || null,
      body: data.body,
      type: data.type,
      authorId: profile.id,
      status: "PENDING_REVIEW",
    },
  });

  revalidatePath("/admin/stories");
  return { success: true };
}

async function resolveTags(tagsCsv: string | undefined): Promise<string[]> {
  if (!tagsCsv) return [];
  const names = tagsCsv
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const ids: string[] = [];
  for (const name of names) {
    const slug = slugify(name);
    const tag = await prisma.tag.upsert({
      where: { slug },
      create: { name, slug },
      update: {},
    });
    ids.push(tag.id);
  }
  return ids;
}

export async function createStory(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_STORIES_MOMENTS);
  const parsed = editStorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const data = parsed.data;
  const baseSlug = slugify(data.title);
  const slugTaken = await prisma.story.findUnique({ where: { slug: baseSlug } });
  const slug = slugTaken ? uniqueSlug(data.title) : baseSlug;
  const tagIds = await resolveTags(data.tags);

  const story = await prisma.story.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt || null,
      body: data.body,
      type: data.type,
      categoryId: data.categoryId || null,
      status: data.status,
      featured: data.featured,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      scheduledAt: data.status === "SCHEDULED" && data.scheduledAt ? new Date(data.scheduledAt) : null,
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
  });

  await writeAuditLog({ actorId: actor.id, action: "story.create", targetType: "Story", targetId: story.id });
  revalidatePath("/admin/stories");
  revalidatePath("/stories");
  return { success: true };
}

export async function updateStory(id: string, input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_STORIES_MOMENTS);
  const parsed = editStorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const data = parsed.data;
  const existing = await prisma.story.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Story not found." };

  const tagIds = await resolveTags(data.tags);

  await prisma.$transaction([
    prisma.storyTag.deleteMany({ where: { storyId: id } }),
    prisma.story.update({
      where: { id },
      data: {
        title: data.title,
        excerpt: data.excerpt || null,
        body: data.body,
        type: data.type,
        categoryId: data.categoryId || null,
        status: data.status,
        featured: data.featured,
        publishedAt: data.status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
        scheduledAt: data.status === "SCHEDULED" && data.scheduledAt ? new Date(data.scheduledAt) : null,
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
    }),
  ]);

  if (data.status === "PUBLISHED" && existing.status !== "PUBLISHED" && existing.authorId) {
    const author = await prisma.profile.findUnique({ where: { id: existing.authorId } });
    if (author) await notify({ recipientId: author.userId, type: "STORY_APPROVED", link: `/stories/${existing.slug}` });
  }

  await writeAuditLog({ actorId: actor.id, action: "story.update", targetType: "Story", targetId: id });
  revalidatePath("/admin/stories");
  revalidatePath(`/admin/stories/${id}`);
  revalidatePath("/stories");
  revalidatePath(`/stories/${existing.slug}`);
  return { success: true };
}

export async function deleteStory(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_STORIES_MOMENTS);

  await prisma.story.update({ where: { id }, data: { deletedAt: new Date(), status: "ARCHIVED" } });
  await writeAuditLog({ actorId: actor.id, action: "story.delete", targetType: "Story", targetId: id });
  revalidatePath("/admin/stories");
  revalidatePath("/stories");
  return { success: true };
}
