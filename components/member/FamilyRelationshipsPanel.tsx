"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestFamilyRelationship, respondFamilyRelationship } from "@/modules/family/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select } from "@/components/ui/Field";

const RELATIONSHIP_TYPES = [
  "FATHER",
  "MOTHER",
  "SON",
  "DAUGHTER",
  "BROTHER",
  "SISTER",
  "SPOUSE",
  "GRANDFATHER",
  "GRANDMOTHER",
  "UNCLE",
  "AUNT",
  "COUSIN",
];

type Relationship = {
  id: string;
  relationshipType: string;
  status: string;
  fromProfileId: string;
  toProfileId: string;
  fromProfile: { firstName: string; lastName: string };
  toProfile: { firstName: string; lastName: string };
};

export function FamilyRelationshipsPanel({
  myProfileId,
  relationships,
}: {
  myProfileId: string;
  relationships: Relationship[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ memberSlug: "", relationshipType: "COUSIN", visibility: "PRIVATE" as const });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await requestFamilyRelationship(form);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setForm({ memberSlug: "", relationshipType: "COUSIN", visibility: "PRIVATE" });
      router.refresh();
    });
  }

  function respond(id: string, accept: boolean) {
    startTransition(async () => {
      await respondFamilyRelationship(id, accept);
      router.refresh();
    });
  }

  const incoming = relationships.filter((r) => r.toProfileId === myProfileId && r.status === "PENDING");
  const outgoingOrConfirmed = relationships.filter((r) => !(r.toProfileId === myProfileId && r.status === "PENDING"));

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
        <FormField label="Member's profile link (slug)" htmlFor="memberSlug">
          <Input
            id="memberSlug"
            placeholder="e.g. ahmed-subzwari-a1b2c3"
            value={form.memberSlug}
            onChange={(e) => setForm({ ...form, memberSlug: e.target.value })}
          />
        </FormField>
        <FormField label="Relationship" htmlFor="relationshipType">
          <Select
            id="relationshipType"
            value={form.relationshipType}
            onChange={(e) => setForm({ ...form, relationshipType: e.target.value as any })}
          >
            {RELATIONSHIP_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        </FormField>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sending…" : "Send request"}
        </Button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {incoming.length > 0 ? (
        <div>
          <p className="text-sm font-medium">Pending requests for you to confirm</p>
          <div className="mt-2 space-y-2">
            {incoming.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded border border-border p-3 text-sm">
                <span>
                  {r.fromProfile.firstName} {r.fromProfile.lastName} says you are their{" "}
                  {r.relationshipType.toLowerCase()}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => respond(r.id, true)} disabled={isPending}>
                    Confirm
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => respond(r.id, false)} disabled={isPending}>
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {outgoingOrConfirmed.length > 0 ? (
        <div>
          <p className="text-sm font-medium">Your relationships</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {outgoingOrConfirmed.map((r) => {
              const other = r.fromProfileId === myProfileId ? r.toProfile : r.fromProfile;
              return (
                <li key={r.id}>
                  {other.firstName} {other.lastName} — {r.relationshipType.toLowerCase()} ({r.status.toLowerCase()})
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
