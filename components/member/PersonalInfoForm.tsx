"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePersonalInfo } from "@/modules/profile/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";

type Country = { id: string; name: string };
type City = { id: string; name: string; countryId: string };

export function PersonalInfoForm({
  initial,
  countries,
  cities,
}: {
  initial: {
    firstName: string;
    middleName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    countryId: string;
    cityId: string;
    currentResidence: string;
    nationality: string;
    bio: string;
  };
  countries: Country[];
  cities: City[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [form, setForm] = useState(initial);

  const filteredCities = useMemo(
    () => cities.filter((c) => c.countryId === form.countryId),
    [cities, form.countryId],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await updatePersonalInfo(form);
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
      <div className="grid grid-cols-3 gap-4">
        <FormField label="First name" htmlFor="firstName">
          <Input id="firstName" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        </FormField>
        <FormField label="Middle name" htmlFor="middleName">
          <Input id="middleName" value={form.middleName} onChange={(e) => setForm({ ...form, middleName: e.target.value })} />
        </FormField>
        <FormField label="Last name" htmlFor="lastName">
          <Input id="lastName" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Gender (optional)" htmlFor="gender">
          <Select id="gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="">Prefer not to say</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </Select>
        </FormField>
        <FormField label="Date of birth (optional)" htmlFor="dob">
          <Input id="dob" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Country" htmlFor="country">
          <Select
            id="country"
            value={form.countryId}
            onChange={(e) => setForm({ ...form, countryId: e.target.value, cityId: "" })}
          >
            <option value="">Select country</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="City" htmlFor="city">
          <Select id="city" value={form.cityId} onChange={(e) => setForm({ ...form, cityId: e.target.value })}>
            <option value="">Select city</option>
            {filteredCities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Current residence (optional)" htmlFor="residence">
          <Input id="residence" value={form.currentResidence} onChange={(e) => setForm({ ...form, currentResidence: e.target.value })} />
        </FormField>
        <FormField label="Nationality (optional)" htmlFor="nationality">
          <Input id="nationality" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
        </FormField>
      </div>

      <FormField label="Bio" htmlFor="bio">
        <Textarea id="bio" rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
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
