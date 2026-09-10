"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfilePhoto } from "@/modules/profile/actions";
import { ImageUpload } from "@/components/shared/ImageUpload";

export function ProfilePhotoUpload({ currentUrl }: { currentUrl: string | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState(currentUrl);

  return (
    <div className="flex items-center gap-4">
      {previewUrl ? (
        <img src={previewUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
      ) : (
        <div className="h-16 w-16 rounded-full bg-muted" />
      )}
      <ImageUpload
        folder="profiles"
        onUploaded={(mediaId, url) => {
          setPreviewUrl(url);
          startTransition(async () => {
            await updateProfilePhoto(mediaId);
            router.refresh();
          });
        }}
      />
      {isPending ? <span className="text-sm text-muted-foreground">Saving…</span> : null}
    </div>
  );
}
