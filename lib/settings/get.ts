import "server-only";
import type { SettingCategory } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

/** Reads one admin-configurable setting, falling back to a code default when unset (ARCHITECTURE.md §26). */
export async function getSetting<T = string>(
  category: SettingCategory,
  key: string,
  fallback: T,
): Promise<T> {
  const setting = await prisma.siteSetting.findUnique({ where: { category_key: { category, key } } });
  if (!setting) return fallback;
  return setting.value as T;
}

export async function getSettingsForCategory(category: SettingCategory) {
  return prisma.siteSetting.findMany({ where: { category }, orderBy: { key: "asc" } });
}
