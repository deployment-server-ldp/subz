"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitMoment } from "@/modules/moments/actions";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select } from "@/components/ui/Field";

const TYPES = [
  "CELEBRATION",
  "WEDDING",
  "GRADUATION",
  "BIRTHDAY",
  "BUSINESS_ACHIEVEMENT",
  "COMMUNITY_GATHERING",
  "FAMILY_GATHERING",
  "OTHER",
];

export function SubmitMomentForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mediaId, setMediaId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState({ caption: "", type: "CELEBRATION" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!mediaId) {
      setError("Upload a photo first.");
      return;
    }
    startTransition(async () => {
      const result = await submitMoment({ ...form, mediaId });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/dashboard");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium">Photo</p>
        <ImageUpload
          folder="moments"
          onUploaded={(id, url) => {
            setMediaId(id);
            setPreviewUrl(url);
          }}
        />
        {previewUrl ? <img src={previewUrl} alt="" className="mt-3 h-40 w-40 rounded object-cover" /> : null}
      </div>
      <FormField label="Type" htmlFor="type">
        <Select id="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replaceAll("_", " ")}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Caption" htmlFor="caption">
        <Input id="caption" required value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
      </FormField>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Submitting…" : "Submit for review"}
      </Button>
    </form>
  );
}
