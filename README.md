# SUBZWARI GLOBAL NETWORK

**SUBZWARI's ARE ONE**
One Name. One Community. One Network.

A global digital community and family network for people who identify as Subzwari —
connecting members worldwide, preserving family heritage, enabling professional
networking, and supporting community events and stories. This is **not** an NGO,
charity, fundraising platform, or commercial marketplace: there is no payments,
donations, or e-commerce functionality anywhere in this codebase.

## ⚠️ Current Status: Architecture Phase (pre-implementation)

Per the project brief, this repository currently contains the **architecture,
database schema, and project scaffold** — the deliverable required for review before
major feature implementation begins. It is not yet a working product. See
"What's implemented so far" below for exactly what runs today.

Read, in order:

1. [`ARCHITECTURE.md`](./ARCHITECTURE.md) — system architecture, sitemap, API design,
   folder structure, auth architecture, RBAC matrix, admin dashboard structure, user
   journey, verification workflow, family-tree data model, design system, MVP phases.
2. [`DATABASE.md`](./DATABASE.md) — narrative ERD and schema design rationale.
3. [`SECURITY.md`](./SECURITY.md) — security architecture and controls.
4. [`prisma/schema.prisma`](./prisma/schema.prisma) — the actual database schema.

## What's implemented so far

- Full Prisma schema (`prisma/schema.prisma`) covering identity/RBAC, profiles, family
  branches/relationships, geography, professional & business directories, events,
  stories, moments, support requests, connections, verification, moderation/reports,
  audit logs, notifications, and CMS/settings tables.
- Next.js 14 (App Router) + TypeScript + Tailwind project scaffold with route groups
  for public / auth / member / admin surfaces.
- Design tokens (colors, fonts) matching the brand direction in `ARCHITECTURE.md` §L.
- A placeholder homepage rendering the hero (brand name, slogan, primary/secondary
  CTAs) — **not yet wired to any backend data**. Every other route in the sitemap is
  documented but not yet built.
- `.env.example` describing every required environment variable.

**Nothing here fakes functionality.** Where a feature isn't built yet, there is no
page, no button, and no seed data pretending otherwise — it's simply not present, and
`ARCHITECTURE.md` §M lists the phase in which it will be.

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

Seed data is clearly demo/sample data (see `ARCHITECTURE.md` §"Seed Data") and must
never be run against a production database. As of this commit the seed script is a
placeholder — see `prisma/seed.ts` for what's pending (baseline roles/permissions,
Super Admin bootstrap, sample countries/cities/categories/members).

### Admin setup

Once the seed script is implemented, the first Super Admin account is created from
`SEED_SUPER_ADMIN_EMAIL` / `SEED_SUPER_ADMIN_PASSWORD` in `.env`. All further staff
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

## Production Checklist (tracked, not yet all applicable pre-MVP)

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

Development proceeds in the phased order defined in `ARCHITECTURE.md` §M — each phase
ships fully working, backend-connected functionality before the next begins. No phase
is marked complete while any part of it is faked, stubbed, or relies on hardcoded data
that should come from the database/CMS.

## Documentation

- `ARCHITECTURE.md` — system design
- `DATABASE.md` — data model
- `SECURITY.md` — security controls
