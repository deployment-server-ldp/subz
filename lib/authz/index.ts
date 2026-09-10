import "server-only";
import type { SystemRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

// Permission keys — mirrors ARCHITECTURE.md §G. Seeded into
// Role/Permission/RolePermission rows (prisma/seed.ts) so /admin can
// customize assignments; DEFAULT_ROLE_PERMISSIONS below is the fallback used
// for any SystemRole that has no explicit UserRole rows yet, which keeps the
// system usable immediately after seeding.
export const PERMISSIONS = {
  MANAGE_ADMINS_ROLES: "manage_admins_roles",
  MANAGE_SETTINGS: "manage_settings",
  MANAGE_MEMBERS: "manage_members",
  REVIEW_VERIFICATION: "review_verification",
  MANAGE_FAMILY_BRANCHES: "manage_family_branches",
  MANAGE_COUNTRIES_CITIES: "manage_countries_cities",
  MANAGE_STORIES_MOMENTS: "manage_stories_moments",
  MANAGE_EVENTS: "manage_events",
  MANAGE_BUSINESSES: "manage_businesses",
  MODERATE_REPORTS: "moderate_reports",
  MODERATE_CONTENT_QUEUE: "moderate_content_queue",
  VIEW_AUDIT_LOGS: "view_audit_logs",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: PermissionKey[] = Object.values(PERMISSIONS);

export const DEFAULT_ROLE_PERMISSIONS: Record<SystemRole, PermissionKey[]> = {
  SUPER_ADMIN: ALL_PERMISSIONS,
  ADMIN: ALL_PERMISSIONS.filter((p) => p !== PERMISSIONS.MANAGE_ADMINS_ROLES),
  VERIFICATION_MANAGER: [PERMISSIONS.REVIEW_VERIFICATION],
  CONTENT_MANAGER: [
    PERMISSIONS.MANAGE_STORIES_MOMENTS,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.MODERATE_CONTENT_QUEUE,
  ],
  REGIONAL_COORDINATOR: [
    PERMISSIONS.REVIEW_VERIFICATION,
    PERMISSIONS.MANAGE_FAMILY_BRANCHES,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.MANAGE_BUSINESSES,
  ],
  MODERATOR: [PERMISSIONS.MODERATE_REPORTS, PERMISSIONS.MODERATE_CONTENT_QUEUE],
  MEMBER: [],
};

export const STAFF_ROLES: SystemRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "VERIFICATION_MANAGER",
  "CONTENT_MANAGER",
  "REGIONAL_COORDINATOR",
  "MODERATOR",
];

export function isStaffRole(role: SystemRole): boolean {
  return STAFF_ROLES.includes(role);
}

export async function getPermissionsForUser(
  userId: string,
  systemRole: SystemRole,
): Promise<Set<PermissionKey>> {
  if (systemRole === "SUPER_ADMIN") return new Set(ALL_PERMISSIONS);

  const assignments = await prisma.userRole.findMany({
    where: { userId },
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  });

  if (assignments.length > 0) {
    const keys = assignments.flatMap((assignment) =>
      assignment.role.permissions.map((rp) => rp.permission.key as PermissionKey),
    );
    return new Set(keys);
  }

  return new Set(DEFAULT_ROLE_PERMISSIONS[systemRole] ?? []);
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

type AuthzSession = { user?: { id: string; systemRole: SystemRole } } | null;

/** Throws ForbiddenError unless the session's user holds the given permission. Always call this at the top of every admin server action — never trust the UI. */
export async function requirePermission(
  session: AuthzSession,
  permission: PermissionKey,
): Promise<{ id: string; systemRole: SystemRole }> {
  if (!session?.user) throw new ForbiddenError("Not authenticated.");
  const permissions = await getPermissionsForUser(session.user.id, session.user.systemRole);
  if (!permissions.has(permission)) throw new ForbiddenError();
  return session.user;
}

/** Throws unless the session's user is any staff role (coarse admin-area gate; pair with requirePermission for the actual action). */
export function requireStaff(session: AuthzSession): { id: string; systemRole: SystemRole } {
  if (!session?.user || !isStaffRole(session.user.systemRole)) {
    throw new ForbiddenError("Staff access required.");
  }
  return session.user;
}
