import { z } from "zod";

export const storyTypeEnum = z.enum([
  "MEMBER",
  "FAMILY",
  "HERITAGE",
  "HISTORY",
  "ACHIEVEMENT",
  "PROFESSIONAL_JOURNEY",
  "COMMUNITY",
  "GLOBAL",
]);

export const submitStorySchema = z.object({
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().max(300).optional().or(z.literal("")),
  body: z.string().trim().min(1, "Story content is required").max(20000),
  type: storyTypeEnum,
});

export const editStorySchema = z.object({
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().max(300).optional().or(z.literal("")),
  body: z.string().trim().min(1).max(20000),
  type: storyTypeEnum,
  categoryId: z.string().uuid().optional().or(z.literal("")),
  tags: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "SCHEDULED", "REJECTED", "ARCHIVED"]),
  scheduledAt: z.string().optional().or(z.literal("")),
  featured: z.boolean().default(false),
});
