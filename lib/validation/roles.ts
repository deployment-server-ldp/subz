import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().trim().min(1).max(100),
  permissionKeys: z.array(z.string()).min(1, "Select at least one permission"),
});

export const assignRoleSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  roleId: z.string().uuid(),
});
