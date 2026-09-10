import { z } from "zod";

export const pageSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
  body: z.string().trim().min(1, "Content is required").max(20000),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export const navItemSchema = z.object({
  label: z.string().trim().min(1).max(100),
  href: z.string().trim().min(1).max(200),
  displayOrder: z.coerce.number().int().default(0),
});

export const footerItemSchema = z.object({
  section: z.string().trim().min(1).max(100),
  label: z.string().trim().min(1).max(100),
  href: z.string().trim().min(1).max(200),
  displayOrder: z.coerce.number().int().default(0),
});
