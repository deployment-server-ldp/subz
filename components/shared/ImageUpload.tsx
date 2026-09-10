"use client";

import { useId, useState } from "react";
import { createMediaRecord } from "@/modules/media/actions";

type Folder = "profiles" | "businesses" | "events" | "stories" | "moments" | "countries" | "family-branches";

/**
 * Direct-to-bucket image upload: requests a signed URL from our server,
 * PUTs the file straight to S3/R2, then records the Media row. Requires
 * real STORAGE_* credentials to actually succeed (see .env.example) — in an
 * environment without them configured, the signed-URL request itself fails
 * with a clear error rather than silently pretending to upload.
 */
export function ImageUpload({
  folder,
  onUploaded,
}: {
  folder: Folder;
  onUploaded: (mediaId: string, publicUrl: string) => void;
}) {
  const inputId = useId();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const signRes = await fetch("/api/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder, contentType: file.type, sizeBytes: file.size }),
      });
      if (!signRes.ok) {
        const body = await signRes.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not prepare upload.");
      }
      const { uploadUrl, publicUrl } = await signRes.json();

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("Upload to storage failed.");

      const result = await createMediaRecord({ url: publicUrl, mimeType: file.type, sizeBytes: file.size });
      if (!result.success) throw new Error(result.error);

      onUploaded(result.mediaId, publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <label
        htmlFor={inputId}
        className="inline-flex cursor-pointer items-center justify-center rounded border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:bg-muted aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
        aria-disabled={isUploading}
      >
        {isUploading ? "Uploading…" : "Choose image"}
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleChange}
        disabled={isUploading}
        className="hidden"
      />
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
