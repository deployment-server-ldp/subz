import crypto from "node:crypto";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** Appends a short random suffix so slugs derived from common names stay unique. */
export function uniqueSlug(base: string): string {
  const suffix = crypto.randomBytes(3).toString("hex");
  const slugBase = slugify(base) || "member";
  return `${slugBase}-${suffix}`;
}
