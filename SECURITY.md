# SUBZWARI GLOBAL NETWORK — Security Architecture

Security is treated as a first-class requirement, not a pass at the end. This document
covers the controls the platform commits to and where each is enforced.

## 1. Authentication

- Passwords hashed with argon2id (fallback bcrypt cost ≥ 12). Never logged, never returned
  in any API/server-action response, never stored in plaintext anywhere (including error
  logs — errors are sanitized before logging).
- Email OTP codes are hashed at rest and are single-use, 10-minute expiry, rate-limited per
  email and per IP.
- Sessions are database-backed (revocable) rather than long-lived stateless JWTs, so a
  suspension, role change, or password reset invalidates active sessions immediately.
- Login, OTP request/verify, and password reset endpoints are rate-limited (per-IP and
  per-account) and return generic errors that do not reveal whether an email is registered.
- Optional Google OAuth is additive and never the only path to an admin-role account.

## 2. Authorization (defense in depth)

- **Middleware layer**: route-group middleware blocks unauthenticated access to
  `(member)`/`(admin)` route groups before any page code runs.
- **Server-action/route-handler layer**: every mutation re-derives the session server-side
  and calls a single `lib/authz` permission check — the UI's role display is never trusted.
- **Query layer**: directory/profile read paths apply visibility filters
  (PUBLIC/COMMUNITY/PRIVATE) inside the query builder itself, not as a post-fetch filter, so
  a bug in a page component cannot leak private rows.
- **Regional scoping**: Regional Coordinator permission checks additionally filter by the
  coordinator's `RegionalAssignment` rows.
- Admin panel access requires both `systemRole` in the staff set **and** the specific
  permission for the action being performed — a Content Manager account cannot approve
  verification requests even if it reaches `/admin/verification` in the UI, because the
  server action rejects it.

## 3. Input Validation & Injection Prevention

- All member-submitted and admin-submitted input is validated with Zod schemas shared
  between the client form and the server action/route handler — the server never trusts
  client-side validation alone.
- Prisma's parameterized queries eliminate SQL injection for all standard queries; any raw
  SQL (if ever required for a reporting query) must use Prisma's tagged-template
  `$queryRaw` (parameterized), never string concatenation.
- Rich text (story body, bio, event/business descriptions) is sanitized server-side
  (allow-list HTML sanitizer) before storage and again escaped/rendered through a safe
  renderer — never `dangerouslySetInnerHTML` on unsanitized input.
- File uploads: validated by actual content-type sniffing (not just file extension), size
  limits enforced server-side, images re-encoded/stripped of EXIF on ingest, uploaded to
  object storage under randomized keys (never user-controlled paths), served from a
  separate asset domain/bucket with no execute permissions.

## 4. Session & CSRF

- Auth.js CSRF token enforced on credential-based POST flows.
- Server Actions rely on Next.js's built-in same-origin enforcement; `/api/**` mutating
  routes additionally check `Origin`/`Referer` against the configured app URL.
- Session cookies: `HttpOnly`, `Secure` (production), `SameSite=Lax` (or `Strict` where UX
  allows), rotated on privilege change (login, role change, password change).

## 5. Rate Limiting & Abuse Prevention

Applied (via a shared `lib/rate-limit` using a token-bucket/sliding-window store, e.g.
Redis/Upstash in production, in-memory in dev) to:
- Login, register, OTP request/verify, password reset.
- Connection requests, contact/introduction requests (prevents scraping/harassment).
- Report submission (prevents report-flooding as a harassment vector).
- Public search/directory API (prevents scraping the full member list).

## 6. Data Privacy

- Sensitive personal data (phone, home address, government-ID reference) is modeled in a
  separate `PrivateContactInfo` table (see `DATABASE.md`) that is structurally excluded from
  any public or community-facing query — not just filtered by convention.
- Directory/search results and public profile pages only ever render fields appropriate to
  the viewer's relationship to the profile (public visitor / connected member / self /
  staff), resolved server-side.
- `Profile.isIndexable` is only ever set true when `visibility = PUBLIC` **and**
  `verificationStatus = VERIFIED`; search-engine indexing directives (`robots` meta) are
  derived from this flag, never assumed.
- Family relationship visibility is independent per-edge (see `ARCHITECTURE.md` §K) so a
  member cannot be pulled into someone else's public family tree without confirming the
  relationship themselves.

## 7. Admin & Audit

- Every state-changing admin action (verification decision, status change, content
  approval/rejection/removal, role/permission change, settings change) writes an
  `AuditLog` row via one shared helper (`lib/audit`) called from the action itself — new
  admin features cannot ship without also logging, because the shared mutation helpers
  require an audit call to compile against the expected pattern documented for
  contributors.
- Audit logs are append-only (no update/delete API exposed) and viewable only to roles with
  `view_audit_logs`.

## 8. Infrastructure

- Secrets only via environment variables (`.env`, never committed — see `.env.example` for
  the required shape with placeholder values only).
- Database connections use TLS in production; least-privilege DB role for the app
  (no superuser).
- Object storage buckets are private by default with signed URLs for upload; public read
  only for approved, moderated media (post-approval, assets are copied/flagged accessible —
  pending-moderation uploads are not publicly reachable by guessable URL).
- Dependency updates and `npm audit`/`pnpm audit` are part of the CI checklist before
  production deploys (see README "Production Checklist").

## 9. Non-Goals (explicitly out of scope, reduces attack surface)

No payments, no donations, no wallet/crypto integration, no real-time chat/websocket
surface in MVP — each of these would otherwise expand the attack surface (PCI scope,
financial fraud vectors, real-time injection risks) for no requested benefit.
