import type { AccountStatus, SystemRole, VerificationStatus } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

// Augments NextAuth's session/JWT shape with the fields this platform needs
// on every request (see lib/auth/options.ts for how they're populated).
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      systemRole: SystemRole;
      accountStatus: AccountStatus;
      profileId: string | null;
      profileSlug: string | null;
      verificationStatus: VerificationStatus | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    invalid?: boolean;
    systemRole?: SystemRole;
    accountStatus?: AccountStatus;
    profileId?: string | null;
    profileSlug?: string | null;
    verificationStatus?: VerificationStatus | null;
  }
}
