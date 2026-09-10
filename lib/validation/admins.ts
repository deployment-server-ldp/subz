import { z } from "zod";

export const setSystemRoleSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum([
    "SUPER_ADMIN",
    "ADMIN",
    "VERIFICATION_MANAGER",
    "CONTENT_MANAGER",
    "REGIONAL_COORDINATOR",
    "MODERATOR",
    "MEMBER",
  ]),
});
