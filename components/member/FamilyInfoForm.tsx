"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateFamilyInfo } from "@/modules/profile/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Field";

export function FamilyInfoForm({
  initial,
}: {
  initial: {
    fathersName: string;
    grandfathersName: string;
    greatGrandfathersName: string;
    ancestralRegion: string;
    familyInformation: string;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [form, setForm] = useState(initial);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await updateFamilyInfo(form);
      if (!result.success) {
        setMessage({ type: "error", text: result.error });
        return;
      }
      setMessage({ type: "success", text: "Saved." });
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <p className="text-sm text-muted-foreground">
        This information is never shown publicly by default (see your Privacy settings). It helps
        connect you with your family branch and relatives across the community.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Father's name" htmlFor="fathersName">
          <Input id="fathersName" value={form.fathersName} onChange={(e) => setForm({ ...form, fathersName: e.target.value })} />
        </FormField>
        <FormField label="Grandfather's name" htmlFor="grandfathersName">
          <Input id="grandfathersName" value={form.grandfathersName} onChange={(e) => setForm({ ...form, grandfathersName: e.target.value })} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Great-grandfather's name (optional)" htmlFor="greatGrandfathersName">
          <Input
            id="greatGrandfathersName"
            value={form.greatGrandfathersName}
            onChange={(e) => setForm({ ...form, greatGrandfathersName: e.target.value })}
          />
        </FormField>
        <FormField label="Ancestral region" htmlFor="ancestralRegion">
          <Input id="ancestralRegion" value={form.ancestralRegion} onChange={(e) => setForm({ ...form, ancestralRegion: e.target.value })} />
        </FormField>
      </div>
      <FormField label="Family information" htmlFor="familyInformation">
        <Textarea
          id="familyInformation"
          rows={4}
          value={form.familyInformation}
          onChange={(e) => setForm({ ...form, familyInformation: e.target.value })}
        />
      </FormField>

      {message ? (
        <p className={`text-sm ${message.type === "error" ? "text-red-600" : "text-emerald-700"}`}>{message.text}</p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
