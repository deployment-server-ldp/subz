"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePrivacySettings } from "@/modules/profile/actions";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";

type Preferences = {
  visibility: "PUBLIC" | "COMMUNITY" | "PRIVATE";
  openToNetworking: boolean;
  openToMentorship: boolean;
  openToBusinessNetwork: boolean;
  openToEvents: boolean;
  openToHelping: boolean;
};

const TOGGLES: { key: keyof Omit<Preferences, "visibility">; label: string }[] = [
  { key: "openToNetworking", label: "Open to professional networking" },
  { key: "openToMentorship", label: "Open to mentorship" },
  { key: "openToBusinessNetwork", label: "Open to business networking" },
  { key: "openToEvents", label: "Open to community events" },
  { key: "openToHelping", label: "Open to helping other members" },
];

export function PrivacyForm({ initial }: { initial: Preferences }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [form, setForm] = useState(initial);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await updatePrivacySettings(form);
      if (!result.success) {
        setMessage({ type: "error", text: result.error });
        return;
      }
      setMessage({ type: "success", text: "Saved." });
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <div>
        <p className="mb-1 text-sm font-medium">Profile visibility</p>
        <Select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value as Preferences["visibility"] })}>
          <option value="PUBLIC">Public — visible to anyone, including search engines (once verified)</option>
          <option value="COMMUNITY">Community only — visible to signed-in members</option>
          <option value="PRIVATE">Private — hidden from directory and search</option>
        </Select>
        <p className="mt-1 text-xs text-muted-foreground">
          Your phone number, home address, and private family details are never shown publicly,
          regardless of this setting.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Community preferences</p>
        {TOGGLES.map((toggle) => (
          <label key={toggle.key} className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={form[toggle.key]}
              onChange={(e) => setForm({ ...form, [toggle.key]: e.target.checked })}
            />
            {toggle.label}
          </label>
        ))}
      </div>

      {message ? (
        <p className={`text-sm ${message.type === "error" ? "text-red-600" : "text-emerald-700"}`}>{message.text}</p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
