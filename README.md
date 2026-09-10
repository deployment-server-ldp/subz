# SUBZWARI GLOBAL NETWORK

**SUBZWARI's ARE ONE**
One Name. One Community. One Network.

A global digital community and family network for people who identify as Subzwari —
connecting members worldwide, preserving family heritage, enabling professional
networking, and supporting community events and stories. This is **not** an NGO,
charity, fundraising platform, or commercial marketplace: there is no payments,
donations, or e-commerce functionality anywhere in this codebase.

## Status: MVP implemented, unverified by a real build

Every module in the MVP scope (see `ARCHITECTURE.md` §M) is implemented with real
Prisma-backed server actions, RBAC-checked admin actions, and pages wired to the
database — not placeholders. **One important caveat**: this was built in a sandbox
with no npm registry access, so `npm install`, `prisma generate`, `tsc`, and `next
build` have not been run against this code. Every file was written and manually
reviewed for correctness, and several real bugs (invalid Prisma relations, an
inaccessible upload button, a stray type-widening issue) were found and fixed this
way — but a first real `npm install && npx prisma validate && npm run typecheck &&
npm run build` in an environment with registry access should be treated as an
required verification step, not a formality, before this is considered production-fit.

Read, in order:

1. [`ARCHITECTURE.md`](./ARCHITECTURE.md) — system architecture, sitemap, API design,
   folder structure, auth architecture, RBAC matrix, admin dashboard structure, user
   journey, verification workflow, family-tree data model, design system, MVP phases.
2. [`DATABASE.md`](./DATABASE.md) — narrative ERD and schema design rationale.
3. [`SECURITY.md`](./SECURITY.md) — security architecture and controls.
4. [`prisma/schema.prisma`](./prisma/schema.prisma) — the actual database schema.

## What's implemented

- **Identity & auth**: registration, email OTP verification, password + email-code
  login, forgot/reset password, optional Google sign-in, RBAC permission checks
  (DB-driven, with a sane default per system role), audit logging, rate limiting.
- **Member profile**: personal/professional/family info, privacy visibility controls,
  profile-photo upload (real signed S3/R2 upload flow), profile-completion tracking.
- **Verification workflow**: member submission (snapshotted at submission time), admin
  queue, approve/reject/request-more-info with history and notifications, suspend/
  restore independent of any open request.
- **Directory**: member and professional search/filter/pagination, enforcing
  visibility + verified-only rules server-side; individual profile pages.
- **Geography**: admin-managed countries/cities; public country/city community pages;
  a fully data-driven homepage (stats, "Around the World", featured members,
  professional categories, stories, moments — nothing hardcoded).
- **Businesses**: submission, admin moderation queue, public directory.
- **Family**: admin-managed family branches with member association requests;
  consent-based family relationships (edges requiring the other member's confirmation).
- **Events**: propose → admin approve/publish, public listing, RSVP with capacity.
- **Stories**: member submission plus a full admin CMS (draft/publish/schedule/
  feature/categories/tags), public list/detail with SEO-friendly metadata.
- **Moments**: submission with a real photo upload, admin moderate/feature, public
  gallery.
- **Community support**: submit/moderate/browse-and-offer-help — no payments anywhere.
- **Connections & notifications**: request/accept/reject/remove, contact requests,
  a notification center with unread counts.
- **Reports & moderation**: a reusable report action wired into profile/business/
  event/story pages, an admin triage queue, and an audit-log viewer.
- **Admin**: dashboard with live KPIs, member management (search/filter/suspend/
  restore), staff account management, a roles & permissions screen (baseline matrix
  plus custom role creation), a settings module (homepage hero text + generic
  per-category key/value settings — no code change needed to update site copy), and
  a CMS for generic content pages/navigation/footer.
- **SEO**: per-page metadata, `sitemap.xml`, `robots.txt` (admin/dashboard/api
  disallowed), private/unverified profiles excluded from indexing via `isIndexable`.
- **Seed data**: `prisma/seed.ts` seeds permissions, an optional Super Admin bootstrap,
  countries/cities, professional/business/story categories, demo members, and one
  demo business/story/event/family branch — all clearly synthetic.

**Not built** (explicitly out of MVP scope per the brief): payments/donations/
fundraising of any kind, real-time chat, video calling, a mobile app, advanced
genealogy visualization beyond the relationship-edge model, and multilingual support.
The schema and module boundaries are shaped so these can be added later without a
rewrite (see `ARCHITECTURE.md` and `DATABASE.md` "Future-Ready Notes").

**Known simplifications** (documented in code comments where they occur): city
detail pages resolve by slug via first-match rather than a globally unique slug
(cities are only unique per-country); the in-memory rate limiter is single-instance
only (swap for Upstash Redis before running more than one server instance); business
logos and event/story cover images aren't wired to the upload flow yet (profile
photos and moment photos are); the "Verified only" directory filter from the brief is
enforced unconditionally rather than as a toggle, per ARCHITECTURE.md §I's rule that
unverified members are excluded from search by default.

## Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js Server Actions + Route Handlers
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js (email/password + email OTP; optional Google OAuth)
- **Storage**: S3-compatible object storage (Cloudflare R2 by default)
- **Email**: provider-agnostic (`lib/email`), configured via env vars

## Installation

```bash
git clone <this-repo>
cd subz
npm install
cp .env.example .env
# fill in DATABASE_URL, NEXTAUTH_SECRET, etc. in .env
```

### Database setup

Requires a running PostgreSQL instance.

```bash
# generate the Prisma client
npm run prisma:generate

# create and apply migrations in development
npm run prisma:migrate
```

### Seed data

```bash
npm run db:seed
```

Seed data is clearly demo/sample data (see `prisma/seed.ts`) and must never be run
against a production database. It seeds: permission rows, an optional Super Admin
(from `SEED_SUPER_ADMIN_EMAIL`/`SEED_SUPER_ADMIN_PASSWORD`), 8 countries with cities,
professional/business/story categories, 6 demo members (password `Demo1234!`, clearly
`@demo.subzwari.example` addresses), and one demo business/story/event/family branch.

### Admin setup

Set `SEED_SUPER_ADMIN_EMAIL` and `SEED_SUPER_ADMIN_PASSWORD` in `.env` before running
`npm run db:seed` to bootstrap the first Super Admin account. All further staff
accounts and role/permission assignments are managed from `/admin/admins` and
`/admin/roles-permissions` — no code changes required.

### Authentication setup

Set `NEXTAUTH_URL` and a strong `NEXTAUTH_SECRET` in `.env`. Google OAuth is optional
and only enabled when both `AUTH_GOOGLE_ENABLED=true` and its client ID/secret are set.

### Run the dev server

```bash
npm run dev
```

## Deployment

Target: any Node.js hosting platform that supports Next.js (e.g. a container behind a
reverse proxy, or a platform like Render/Fly/Vercel). At minimum:

1. Provision PostgreSQL and an S3-compatible bucket.
2. Set all variables from `.env.example` in the hosting platform's environment config.
3. `npm run build && npm run prisma:deploy` (applies committed migrations — never
   `prisma migrate dev` in production) then `npm run start`.
4. Point the app's custom domain at the deployment and enable TLS.

## Production Checklist

- [ ] `npm install && npx prisma validate && npm run typecheck && npm run build`
      passes clean in a real environment (not yet run against this code — see
      "Status" above)
- [ ] All secrets set via platform environment config, none committed
- [ ] `NEXTAUTH_SECRET` is a strong, unique value per environment
- [ ] Database uses a least-privilege role and TLS connection
- [ ] Object storage buckets are private by default with signed upload URLs
- [ ] Rate limiting backed by a shared store (Upstash Redis or equivalent), not in-memory
- [ ] Email provider configured and verified (SPF/DKIM) for the sending domain
- [ ] `npm run typecheck`, `npm run lint`, and `npm audit` pass clean
- [ ] Automated database backups configured
- [ ] Error monitoring configured (no secrets in logged error payloads)
- [ ] Sitemap/robots.txt verified; private profiles confirmed excluded from indexing

## Development Approach

Development followed the phased order defined in `ARCHITECTURE.md` §M — each phase
shipped fully working, backend-connected functionality before the next began. No
phase was marked complete while any part of it was faked, stubbed, or relied on
hardcoded data that should come from the database/CMS. See "Status" above for the
one honest caveat: this hasn't been through a real `npm install`/build yet.

## Documentation

- `ARCHITECTURE.md` — system design
- `DATABASE.md` — data model
- `SECURITY.md` — security controls
