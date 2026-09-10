import type { Profile } from "@prisma/client";

const WEIGHTED_FIELDS: { check: (p: Profile) => boolean; label: string }[] = [
  { check: (p) => !!p.photoMediaId, label: "Profile photo" },
  { check: (p) => !!p.bio, label: "Bio" },
  { check: (p) => !!p.countryId, label: "Country" },
  { check: (p) => !!p.cityId, label: "City" },
  { check: (p) => !!p.profession, label: "Profession" },
  { check: (p) => !!p.company || !!p.jobTitle, label: "Professional details" },
  { check: (p) => !!p.education, label: "Education" },
  { check: (p) => !!p.ancestralRegion || !!p.fathersName, label: "Family information" },
  { check: (p) => p.skills.length > 0, label: "Skills" },
];

export function computeProfileCompletion(profile: Profile): {
  percent: number;
  missing: string[];
} {
  const missing = WEIGHTED_FIELDS.filter((f) => !f.check(profile)).map((f) => f.label);
  const percent = Math.round(((WEIGHTED_FIELDS.length - missing.length) / WEIGHTED_FIELDS.length) * 100);
  return { percent, missing };
}
