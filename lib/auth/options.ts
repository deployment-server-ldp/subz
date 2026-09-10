import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { verifyOtp } from "@/lib/auth/otp";

const googleEnabled =
  process.env.AUTH_GOOGLE_ENABLED === "true" &&
  !!process.env.AUTH_GOOGLE_CLIENT_ID &&
  !!process.env.AUTH_GOOGLE_CLIENT_SECRET;

export const authOptions: NextAuthOptions = {
  // The Credentials provider requires JWT sessions (NextAuth cannot persist
  // a DB session row from a credentials-based sign-in). To still get the
  // "a suspension/role change takes effect immediately" property described
  // in ARCHITECTURE.md §F, the jwt() callback below re-reads the user's
  // current role/status from the database on every session check (i.e. on
  // every getServerSession() call), rather than trusting a stale claim
  // baked into the token at login time.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user || !user.passwordHash) return null;
        if (user.accountStatus !== "ACTIVE") return null;

        const valid = await verifyPassword(user.passwordHash, credentials.password);
        if (!valid) return null;

        return { id: user.id, email: user.email };
      },
    }),
    CredentialsProvider({
      id: "otp",
      name: "Email code",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.code) return null;
        const user = await verifyOtp(credentials.email, credentials.code, "LOGIN");
        if (!user) return null;
        if (user.accountStatus !== "ACTIVE") return null;
        return { id: user.id, email: user.email };
      },
    }),
    ...(googleEnabled
      ? [
          GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_CLIENT_ID!,
            clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // No Adapter is wired (see ARCHITECTURE.md §F) — for Google we persist
      // the User row ourselves here rather than requiring next-auth's Prisma
      // adapter schema, since we only need identity, not stored OAuth tokens.
      if (account?.provider === "google") {
        if (!user.email) return false;
        const email = user.email.toLowerCase();
        const existing = await prisma.user.findUnique({ where: { email } });
        if (!existing) {
          await prisma.user.create({
            data: { email, emailVerifiedAt: new Date() },
          });
        } else if (existing.accountStatus !== "ACTIVE") {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email.toLowerCase() } });
        if (dbUser) token.userId = dbUser.id;
      }

      if (token.userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.userId },
          include: { profile: { select: { id: true, slug: true, verificationStatus: true } } },
        });

        if (!dbUser || dbUser.accountStatus !== "ACTIVE") {
          token.invalid = true;
        } else {
          token.invalid = false;
          token.systemRole = dbUser.systemRole;
          token.accountStatus = dbUser.accountStatus;
          token.profileId = dbUser.profile?.id ?? null;
          token.profileSlug = dbUser.profile?.slug ?? null;
          token.verificationStatus = dbUser.profile?.verificationStatus ?? null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (!token.userId || token.invalid || !token.systemRole || !token.accountStatus) {
        // @ts-expect-error — intentionally emptied so callers must null-check.
        session.user = undefined;
        return session;
      }

      session.user = {
        id: token.userId,
        email: session.user?.email ?? "",
        systemRole: token.systemRole,
        accountStatus: token.accountStatus,
        profileId: token.profileId ?? null,
        profileSlug: token.profileSlug ?? null,
        verificationStatus: token.verificationStatus ?? null,
      };

      return session;
    },
  },
};
