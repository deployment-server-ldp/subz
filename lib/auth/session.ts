import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

/** The single entry point for reading the current session server-side. */
export async function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getCurrentSession();
  if (!session?.user) {
    throw new Error("Authentication required.");
  }
  return session;
}
