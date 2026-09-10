"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { requirePermission, PERMISSIONS } from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit";
import { slugify } from "@/lib/slug";
import { countrySchema, citySchema } from "@/lib/validation/geography";
import type { ActionResult } from "@/modules/identity/actions";

export async function createCountry(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_COUNTRIES_CITIES);
  const parsed = countrySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const data = parsed.data;
  const slug = slugify(data.name);
  const existing = await prisma.country.findUnique({ where: { slug } });
  if (existing) return { success: false, error: "A country with that name already exists." };

  const country = await prisma.country.create({
    data: { name: data.name, slug, isoCode: data.isoCode || null, summary: data.summary || null, displayOrder: data.displayOrder },
  });

  await writeAuditLog({ actorId: actor.id, action: "country.create", targetType: "Country", targetId: country.id });
  revalidatePath("/admin/countries");
  revalidatePath("/countries");
  return { success: true };
}

export async function updateCountry(id: string, input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_COUNTRIES_CITIES);
  const parsed = countrySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const data = parsed.data;
  await prisma.country.update({
    where: { id },
    data: { name: data.name, isoCode: data.isoCode || null, summary: data.summary || null, displayOrder: data.displayOrder },
  });

  await writeAuditLog({ actorId: actor.id, action: "country.update", targetType: "Country", targetId: id });
  revalidatePath("/admin/countries");
  revalidatePath("/countries");
  return { success: true };
}

export async function deleteCountry(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_COUNTRIES_CITIES);

  const [profileCount, cityCount] = await Promise.all([
    prisma.profile.count({ where: { countryId: id } }),
    prisma.city.count({ where: { countryId: id } }),
  ]);
  if (profileCount > 0 || cityCount > 0) {
    return { success: false, error: "Cannot delete a country that has members or cities. Reassign them first." };
  }

  await prisma.country.delete({ where: { id } });
  await writeAuditLog({ actorId: actor.id, action: "country.delete", targetType: "Country", targetId: id });
  revalidatePath("/admin/countries");
  revalidatePath("/countries");
  return { success: true };
}

export async function createCity(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_COUNTRIES_CITIES);
  const parsed = citySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const data = parsed.data;
  const slug = slugify(data.name);
  const existing = await prisma.city.findUnique({ where: { countryId_slug: { countryId: data.countryId, slug } } });
  if (existing) return { success: false, error: "That city already exists for this country." };

  const city = await prisma.city.create({ data: { name: data.name, slug, countryId: data.countryId } });
  await writeAuditLog({ actorId: actor.id, action: "city.create", targetType: "City", targetId: city.id });
  revalidatePath("/admin/cities");
  return { success: true };
}

export async function deleteCity(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const actor = await requirePermission(session, PERMISSIONS.MANAGE_COUNTRIES_CITIES);

  const profileCount = await prisma.profile.count({ where: { cityId: id } });
  if (profileCount > 0) {
    return { success: false, error: "Cannot delete a city that has members. Reassign them first." };
  }

  await prisma.city.delete({ where: { id } });
  await writeAuditLog({ actorId: actor.id, action: "city.delete", targetType: "City", targetId: id });
  revalidatePath("/admin/cities");
  return { success: true };
}
