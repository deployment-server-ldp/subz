import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { STAFF_ROLES } from "@/lib/authz";

const MEMBER_PREFIXES = ["/dashboard", "/network", "/notifications", "/settings"];

// Coarse, edge-runtime gate only (no DB access here — see SECURITY.md §2).
// Every admin server action independently re-checks the specific permission
// against the database via lib/authz — this middleware only keeps signed-out
// visitors and non-staff accounts out of the shells entirely.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPath = pathname.startsWith("/admin");
  const isMemberPath = MEMBER_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isAdminPath && !isMemberPath) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.invalid) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminPath && !STAFF_ROLES.includes(token.systemRole as any)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/network/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
};
