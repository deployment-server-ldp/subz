"use server";

import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";

export async function createMediaRecord(input: {
  url: string;
  mimeType: string;
  sizeBytes: number;
  altText?: string;
}): Promise<{ success: true; mediaId: string } | { success: false; error: string }> {
  const session = await requireSession();

  const media = await prisma.media.create({
    data: {
      url: input.url,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      altText: input.altText,
      uploadedById: session.user.id,
    },
  });

  return { success: true, mediaId: media.id };
}
