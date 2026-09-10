import { z } from "zod";

export const personalInfoSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  middleName: z.string().trim().max(100).optional().or(z.literal("")),
  lastName: z.string().trim().min(1).max(100),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional().nullable(),
  dateOfBirth: z.string().optional().or(z.literal("")),
  countryId: z.string().uuid().optional().or(z.literal("")),
  cityId: z.string().uuid().optional().or(z.literal("")),
  currentResidence: z.string().trim().max(200).optional().or(z.literal("")),
  nationality: z.string().trim().max(100).optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;

export const professionalInfoSchema = z.object({
  profession: z.string().trim().max(150).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(150).optional().or(z.literal("")),
  company: z.string().trim().max(150).optional().or(z.literal("")),
  industry: z.string().trim().max(150).optional().or(z.literal("")),
  skills: z.array(z.string().trim().max(60)).max(30).default([]),
  education: z.string().trim().max(200).optional().or(z.literal("")),
  university: z.string().trim().max(200).optional().or(z.literal("")),
  linkedinUrl: z.string().trim().url().optional().or(z.literal("")),
  websiteUrl: z.string().trim().url().optional().or(z.literal("")),
  categoryIds: z.array(z.string().uuid()).max(10).default([]),
});
export type ProfessionalInfoInput = z.infer<typeof professionalInfoSchema>;

export const familyInfoSchema = z.object({
  fathersName: z.string().trim().max(150).optional().or(z.literal("")),
  grandfathersName: z.string().trim().max(150).optional().or(z.literal("")),
  greatGrandfathersName: z.string().trim().max(150).optional().or(z.literal("")),
  ancestralRegion: z.string().trim().max(150).optional().or(z.literal("")),
  familyInformation: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type FamilyInfoInput = z.infer<typeof familyInfoSchema>;

export const privacySettingsSchema = z.object({
  visibility: z.enum(["PUBLIC", "COMMUNITY", "PRIVATE"]),
  openToNetworking: z.boolean(),
  openToMentorship: z.boolean(),
  openToBusinessNetwork: z.boolean(),
  openToEvents: z.boolean(),
  openToHelping: z.boolean(),
});
export type PrivacySettingsInput = z.infer<typeof privacySettingsSchema>;
