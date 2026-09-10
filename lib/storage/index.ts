import "server-only";
import crypto from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3-compatible client — works against Cloudflare R2, AWS S3, or any
// S3-compatible endpoint via STORAGE_ENDPOINT (ARCHITECTURE.md §A, §31).
const client = new S3Client({
  region: process.env.STORAGE_REGION || "auto",
  endpoint: process.env.STORAGE_ENDPOINT || undefined,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY || "",
  },
});

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

export class UploadValidationError extends Error {}

/**
 * Returns a signed PUT URL for direct-to-bucket upload plus the public URL
 * the object will be reachable at afterward. Randomized key — never derived
 * from user input — per SECURITY.md §3.
 */
export async function createSignedUploadUrl(params: {
  contentType: string;
  sizeBytes: number;
  folder: "profiles" | "businesses" | "events" | "stories" | "moments" | "countries" | "family-branches";
}): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  if (!ALLOWED_IMAGE_TYPES.has(params.contentType)) {
    throw new UploadValidationError("Only JPEG, PNG, WebP, and GIF images are allowed.");
  }
  if (params.sizeBytes > MAX_UPLOAD_BYTES) {
    throw new UploadValidationError("Files must be 8MB or smaller.");
  }

  const extension = params.contentType.split("/")[1];
  const key = `${params.folder}/${crypto.randomUUID()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.STORAGE_BUCKET,
    Key: key,
    ContentType: params.contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
  const publicUrl = `https://${process.env.NEXT_PUBLIC_MEDIA_HOSTNAME}/${key}`;

  return { uploadUrl, publicUrl, key };
}
