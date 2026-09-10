# SUBZWARI GLOBAL NETWORK — System Architecture

> **SUBZWARI's ARE ONE**
> One Name. One Community. One Network.

This document is the pre-implementation architecture deliverable requested before major
build work begins (see `README.md` §"Development Approach"). It covers:

A. System architecture
B. Sitemap
C. Database ERD / schema (full detail in `DATABASE.md`, implemented in `prisma/schema.prisma`)
D. API architecture
E. Folder structure
F. Authentication architecture
G. Role / permission matrix
H. Admin dashboard structure
I. User journey
J. Verification workflow
K. Family-tree data model
L. Design system
M. MVP development phases

Nothing here is a charity/fundraising/marketplace product. There is no payments, donation,
or e-commerce surface anywhere in this architecture.

---

## A. System Architecture

```
                              ┌─────────────────────────┐
                              │        Browser           │
                              │  (Member / Public / Admin)│
                              └────────────┬─────────────┘
                                           │ HTTPS
                              ┌────────────▼─────────────┐
                              │   Next.js App Router      │
                              │  (SSR + RSC + Route       │
                              │   Handlers, single deploy)│
                              ├───────────────────────────┤
                              │ Public site  │ Member app │
                              │ (SSG/ISR)    │ (SSR/CSR)  │
                              │ Admin app    │ API routes │
                              └──────┬───────────────┬────┘
                                     │               │
                     ┌───────────────▼──┐   ┌────────▼─────────┐
                     │  Auth layer       │   │  Service layer    │
                     │ (NextAuth/Lucia,  │   │ (server actions +  │
                     │  session, RBAC)   │   │  route handlers)   │
                     └───────────────┬──┘   └────────┬─────────┘
                                     │               │
                              ┌──────▼───────────────▼──────┐
                              │  Data access layer (Prisma)  │
                              └──────┬────────────────┬──────┘
                                     │                │
                       ┌─────────────▼───┐   ┌────────▼─────────┐
                       │   PostgreSQL     │   │  Object storage   │
                       │ (primary DB)     │   │  (S3 / R2 buckets)│
                       └──────────────────┘   └────────────────────┘
                                     │
                       ┌─────────────▼───────────────┐
                       │  Background jobs / email      │
                       │  (queue-ready; email provider  │
                       │   abstraction, e.g. Resend/SES)│
                       └────────────────────────────────┘
```

**Principles**

1. **One codebase, three surfaces** — public marketing/community pages, the authenticated
   member app, and the admin CMS all live in one Next.js app under distinct route groups.
   This keeps auth/session/RBAC logic in one place and avoids premature microservices.
2. **Server-first** — data fetching and mutation happen via React Server Components and
   Server Actions / Route Handlers, never via client-trusted state. All authorization is
   re-checked server-side regardless of what the UI shows.
3. **CMS-driven, not hardcoded** — anything content-shaped (countries, categories, stories,
   homepage stats, nav, footer, SEO) is a database row editable from `/admin`, never a
   constant in code.
4. **Modular monolith** — the backend is organized by domain module (identity, verification,
   directory, family, professional, business, events, stories, moments, support,
   connections, notifications, moderation, cms, admin) so it can later be split into
   services if scale requires it, without a rewrite.
5. **Progressive enhancement toward future features** — messaging, mobile apps, advanced
   genealogy, and AI search are explicitly out of MVP scope but the schema and module
   boundaries are shaped so they can be added without breaking changes (see §M and
   `DATABASE.md` "Future-ready notes").

---

## B. Sitemap

### Public (unauthenticated, SEO-indexable unless noted)

```
/                          Home
/about
/history
/community
/members                   Public directory (only PUBLIC-visibility profiles)
/members/[slug]            Public member profile (if visibility = PUBLIC)
/professionals
/professionals/[slug]
/businesses
/businesses/[slug]
/countries
/country/[slug]
/cities/[slug]
/stories
/stories/[slug]
/moments
/events
/events/[slug]
/family                    Family heritage / family branches overview
/family/branches/[slug]
/contact
/privacy
/terms
/community-guidelines
/verification              Explains the verification process
/login
/register
/forgot-password
/reset-password
/verify-email
```

### Member app (authenticated, role = member+)

```
/dashboard                          Member home / profile completion / quick actions
/dashboard/profile                  Edit personal info
/dashboard/profile/professional      Edit professional info
/dashboard/profile/family            Edit family info (non-sensitive) + branch request
/dashboard/profile/privacy           Visibility controls
/dashboard/verification              Submit / track verification
/dashboard/businesses                 Manage my submitted businesses
/dashboard/businesses/new
/dashboard/events                     My RSVPs / events I organize
/dashboard/events/new                 Propose an event
/dashboard/stories/new                Submit a story
/dashboard/moments/new                Submit a moment
/dashboard/support                    My support requests / offers to help
/dashboard/support/new
/network                              Discovery / find Subzwari
/network/connections                  My connections
/network/requests                     Incoming/outgoing connection requests
/notifications
/settings                             Account settings (email, password, deletion)
```

### Admin app (authenticated, role = staff, path-guarded + RBAC-guarded)

```
/admin                                Dashboard overview + charts
/admin/members
/admin/members/[id]
/admin/verification                   Verification queue
/admin/verification/[id]
/admin/family-tree
/admin/family-branches
/admin/family-branches/[id]
/admin/countries
/admin/countries/[id]
/admin/cities
/admin/professionals
/admin/professional-categories
/admin/businesses
/admin/businesses/[id]
/admin/business-categories
/admin/events
/admin/events/[id]
/admin/stories
/admin/stories/[id]
/admin/story-categories
/admin/moments
/admin/moments/[id]
/admin/support-requests
/admin/support-requests/[id]
/admin/connections                    Oversight only (no messaging content)
/admin/reports
/admin/reports/[id]
/admin/notifications                  Admin announcements composer
/admin/admins                         Staff accounts
/admin/roles-permissions
/admin/settings                       General / brand / email / registration / verification /
                                        privacy / moderation / notifications / SEO / countries /
                                        categories / events / community settings
/admin/audit-logs
/admin/cms/pages                      Generic content pages (about/history/etc. copy blocks)
/admin/cms/homepage                   Hero text, stats source config, featured sections
/admin/cms/navigation
/admin/cms/footer
```

---

## D. API Architecture

Next.js Route Handlers under `app/api/**` for anything needing a stable HTTP contract
(webhooks, file upload signing, public JSON for the interactive map), and **Server Actions**
co-located with member/admin forms for mutations that are only ever called from our own UI.
This avoids hand-rolling a REST client for internal forms while still exposing a real API
surface where one is useful (e.g. future mobile app).

```
/api/auth/[...]                NextAuth/Lucia handlers (session, OAuth callback)
/api/auth/otp/request          Email OTP request
/api/auth/otp/verify           Email OTP verification

/api/uploads/sign              Signed URL for direct-to-S3/R2 upload (images only)

/api/public/stats               Homepage community statistics (cached/ISR)
/api/public/countries            Country list + member counts for the world map
/api/public/directory            Public member/professional/business search (paginated)

/api/members/[id]/contact        Create a "request introduction" / contact request
/api/connections                 POST create request; PATCH accept/reject; DELETE remove
/api/notifications                GET list; PATCH mark read

/api/verification                POST submit; GET my status
/api/support-requests             CRUD (own) + list open requests member can help with
/api/events/[id]/rsvp             POST/DELETE
/api/reports                       POST report content

/api/admin/**                      Mirrors admin modules; every handler enforces RBAC
                                    permission checks server-side (never trusts client role)
/api/webhooks/email                Inbound email provider events (bounces, complaints)
```

**Conventions**

- Every mutation validates input with a schema (Zod) shared between client form and server
  action/handler.
- Every handler re-derives the session server-side; permission checks live in a single
  `lib/authz` module, not scattered per-route.
- List endpoints are always paginated (cursor or offset+limit) and never return private
  profiles unless the viewer is authorized.
- Rate limiting middleware applies to auth, OTP, contact/introduction, and report endpoints.

---

## E. Folder Structure

```
subz/
├── app/
│   ├── (public)/                 Marketing + directory + content routes (SSG/ISR)
│   │   ├── page.tsx               Home
│   │   ├── about/…
│   │   ├── members/…
│   │   ├── professionals/…
│   │   ├── businesses/…
│   │   ├── countries/…  country/[slug]/…  cities/[slug]/…
│   │   ├── stories/…  moments/…  events/…  family/…
│   │   └── (legal)/privacy, terms, community-guidelines, verification
│   ├── (auth)/                    login, register, forgot/reset password, verify-email
│   ├── (member)/dashboard/…, network/…, notifications/…, settings/…
│   ├── (admin)/admin/…            Every admin module route
│   └── api/                       Route handlers per §D
├── components/
│   ├── ui/                        Design-system primitives (button, card, badge, etc.)
│   ├── layout/                    Header, footer, nav, admin shell
│   ├── public/                    Homepage sections, world map, cards
│   ├── member/                    Profile forms, privacy controls, dashboard widgets
│   └── admin/                     Tables, moderation queues, charts, form builders
├── lib/
│   ├── auth/                      Session, providers, OTP
│   ├── authz/                     RBAC permission checks (single source of truth)
│   ├── db/                        Prisma client singleton
│   ├── validation/                Zod schemas (shared client/server)
│   ├── email/                     Provider-agnostic email sending + templates
│   ├── storage/                   S3/R2 client, signed URL helpers, image validation
│   ├── audit/                     Audit log writer
│   └── seo/                       Metadata helpers, structured data builders
├── modules/                       Domain services (framework-agnostic business logic)
│   ├── identity/  verification/  directory/  family/  professional/
│   ├── business/  events/  stories/  moments/  support/  connections/
│   ├── notifications/  moderation/  reports/  cms/  settings/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── emails/                        React Email templates
├── public/
├── docs/                          Supplementary diagrams/notes
├── ARCHITECTURE.md  DATABASE.md  SECURITY.md  README.md
└── .env.example
```

Route groups `(public)`, `(auth)`, `(member)`, `(admin)` share the root layout but apply
different middleware/guards and different nav shells.

---

## F. Authentication Architecture

- **Provider**: NextAuth.js (Auth.js) with the Credentials provider (email/password) and an
  Email provider (OTP-style magic code) as the two MVP methods; Google OAuth is wired as an
  optional additional provider behind an env flag (`AUTH_GOOGLE_ENABLED`), never required.
- **Passwords**: hashed with argon2id (via `@node-rs/argon2` or `bcrypt` as fallback), never
  reversible, never logged.
- **Sessions**: database-backed sessions (Prisma session table), not stateless JWT, so a
  suspension or role change takes effect immediately and sessions can be revoked from admin.
- **Email verification**: required before a member can submit verification documents or
  appear in directory search; enforced server-side, not just hidden in the UI.
- **OTP**: short-lived (10 min), single-use, rate-limited, stored hashed.
- **Admin auth**: same login flow, gated additionally by `role in (SUPER_ADMIN, ADMIN,
  VERIFICATION_MANAGER, CONTENT_MANAGER, REGIONAL_COORDINATOR, MODERATOR)`; admin routes are
  protected by middleware AND by per-action permission checks (defense in depth).
- **CSRF**: Auth.js built-in CSRF token for credential-based flows; Server Actions get
  same-origin enforcement from Next.js by default; additional origin check middleware for
  `/api/**` mutating routes.

---

## G. Role / Permission Matrix

Roles are seeded rows (`Role` table) with assignable `Permission` rows (`RolePermission`
join table) — configurable from `/admin/roles-permissions`, not hardcoded enums only. A
baseline enum still exists for system roles that must always exist.

| Permission (examples)              | Super Admin | Admin | Verification Mgr | Content Mgr | Regional Coordinator | Moderator | Member |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| manage_admins_roles                | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| manage_settings                    | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| manage_members (all)               | ✅ | ✅ | ❌ | ❌ | scoped to region | ❌ | ❌ |
| review_verification                | ✅ | ✅ | ✅ | ❌ | scoped | ❌ | ❌ |
| manage_family_branches             | ✅ | ✅ | ❌ | ❌ | scoped | ❌ | ❌ |
| manage_countries_cities            | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| manage_stories_moments             | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| manage_events                      | ✅ | ✅ | ❌ | ✅ | scoped | ❌ | ❌ |
| manage_businesses                  | ✅ | ✅ | ❌ | ❌ | scoped | ❌ | ❌ |
| moderate_reports                   | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| moderate_content_queue             | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| view_audit_logs                    | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| manage_own_profile                 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| submit_verification                | – | – | – | – | – | – | ✅ |
| submit_business/story/moment/event | – | – | – | – | – | – | ✅ |
| connect_with_members                | – | – | – | – | – | – | ✅ |

"Scoped" = Regional Coordinator permissions are additionally filtered by their assigned
`Country`/`Region` (`RegionalAssignment` table).

---

## H. Admin Dashboard Structure

```
/admin (shell: sidebar + topbar with role-based nav visibility)
├── Dashboard        — KPI cards, growth chart, pending-review counts, recent activity
├── Members          — search/filter/edit/status/notes/activity, bulk actions
├── Verification     — queue, detail view (submission + docs + history), approve/reject/
│                       request-info/suspend, all actions audit-logged
├── Family Tree       — relationship browser (admin oversight, privacy-respecting)
├── Family Branches   — CRUD, associate members, approve association requests
├── Countries / Cities — CRUD, assign regional coordinators
├── Professionals      — directory oversight, category management
├── Businesses         — moderation queue + directory oversight, category management
├── Events             — moderation + management, capacity/RSVP oversight
├── Stories            — full CMS: draft/publish/schedule/feature/categories/tags/SEO
├── Moments            — moderation queue, feature/unfeature
├── Support Requests   — moderation + oversight
├── Connections        — oversight (counts/abuse signals only, not content)
├── Reports            — triage queue across all content types
├── Notifications      — compose admin announcements
├── Admins             — staff account management
├── Roles & Permissions — RBAC matrix editor
├── Settings           — general/brand/email/registration/verification/privacy/moderation/
│                         notifications/SEO/countries/categories/events/community
└── Audit Logs         — filterable, immutable log viewer
```

Every list view: search + filters + pagination + bulk actions where applicable. Every
detail view: activity/history panel. Every destructive/state-changing action: confirmation
dialog + audit log entry.

---

## I. User Journey

```
Discover platform
   → Register (email/password or OTP)
   → Verify email
   → Complete profile (personal → family → professional → preferences)
   → Set privacy visibility
   → Submit verification request
   → [Admin reviews] → Verified / Rejected / More info requested
   → Verified member appears in directory (per own visibility settings)
   → Explore: directory, professionals, businesses, countries, family branches
   → Connect with other members (request → accept)
   → Request introduction / contact member (privacy-respecting)
   → Join/RSVP events, submit stories/moments, request/offer community support
   → Ongoing: notifications, profile completion nudges, dashboard
```

Unverified members can still browse public content and manage their own profile, but are
clearly labeled "Verification Pending" and excluded from directory search results until
verified (configurable in Settings → Verification).

---

## J. Verification Workflow

```
Registered
   ↓ member submits verification info (family info, optional supporting details)
Verification Pending
   ↓ enters admin queue
Under Review (assigned/opened by a Verification Manager or Admin)
   ↓
   ├── Approve            → Verified
   ├── Reject              → Rejected (with reason, member notified, may resubmit)
   └── Request More Info    → back to Verification Pending (member notified what's missing)

Verified
   └── Suspend (policy violation, disputed info, report upheld) → Suspended
        └── Restore → Verified (logged)
```

- Verification methodology (what fields/evidence are required) is configurable from
  `/admin/settings/verification` — no government ID requirement by default.
- Every transition writes a `VerificationReview` row (reviewer, decision, notes, timestamp)
  and an `AuditLog` entry. Full history is visible to admins on the member's verification
  detail page.
- Status is a first-class field on `User`/`Profile` (`VerificationStatus` enum) so it can
  gate directory visibility, badges, and business/event/story submission permissions.

---

## K. Family-Tree Data Model (MVP-scoped, expansion-ready)

MVP intentionally ships **simple, privacy-controlled relationship links**, not a full
genealogy engine:

- `FamilyBranch` — named lineage/region grouping members can request association with.
- `FamilyRelationship` — a directed edge between two `Profile`s: `(fromProfileId,
  toProfileId, relationshipType, visibility, status)`. `relationshipType` enum covers
  father/mother/son/daughter/brother/sister/spouse/grandfather/grandmother/uncle/aunt/cousin.
  `status` (PENDING/CONFIRMED) requires the linked member to confirm the relationship before
  it becomes visible to either party's connections — no member is linked into someone else's
  tree without consent.
- Visibility (PUBLIC/COMMUNITY/PRIVATE, defaulting to PRIVATE) is per-relationship, not
  inherited automatically from profile visibility, so a member can show their branch
  publicly while keeping specific relationships private.
- Non-sensitive lineage fields (father's/grandfather's/great-grandfather's name, ancestral
  region) live directly on `Profile` as free text for members who want to record heritage
  without a confirmed reciprocal relationship — these are never publicly exposed by default.

**Why this shape scales**: representing relationships as directed edges with a type enum
(rather than fixed columns like `father_id`, `mother_id`) means adding new relationship
types or building a full tree/graph visualization later is additive — no migration of
existing data, no schema redesign. A future "advanced genealogy" module can layer a
graph-traversal read model on top of the same edge table.

---

## L. Design System

**Direction**: premium, modern, global, trustworthy, family-oriented — not a generic SaaS
template, not a "cheap community website."

- **Typography**: one confident serif or high-contrast display face for headlines (identity,
  gravitas) + a clean grotesk/sans for UI and body text. Generous line-height, restrained
  weight range.
- **Color**: a premium neutral base (warm off-white / deep charcoal for dark mode) with a
  single deep accent (e.g. a deep emerald or navy — evokes trust/heritage, not startup-blue)
  and a muted gold/bronze used sparingly for verification badges and premium accents only.
  No loud gradients.
- **Layout**: spacious, generous whitespace, strong grid, large photography (real community
  photography, not stock-clichéd), elegant cards with soft shadows and 1px hairline borders
  rather than heavy drop shadows.
- **Motion**: subtle fade/slide-in on scroll, no parallax gimmicks, no auto-playing
  carousels that fight for attention.
- **Iconography**: a single consistent icon set (e.g. Lucide) at consistent stroke width.
- **World map**: a stylized, low-noise vector map (not a busy embedded Google Map) with
  highlighted countries and a subtle accent-colored marker/pulse per country that has
  verified members.
- **Verification badge**: a small, consistent checkmark badge — a recognizable trust signal
  reused everywhere a verified member/business appears (directory cards, profile header,
  business listing).
- **Components** live in `components/ui` as the single design-system source: Button, Badge,
  Card, Avatar, Tabs, Table, DataTable (admin), Modal, Drawer, FormField, Select, Combobox,
  StatCard, Timeline (for verification/audit history), MapWorld, EmptyState, Skeleton.
- **Dark mode**: supported via CSS variables/tokens from day one (Tailwind `dark:` + token
  layer), not bolted on later.

Design tokens (colors, spacing, radii, shadows) are defined once in `tailwind.config.ts` /
`app/globals.css` as CSS variables so the admin "Brand" settings module can eventually
theme logo/accent color without a redeploy.

---

## M. MVP Development Phases

Matches the staged approach requested — each phase ships working, connected functionality
before the next begins; nothing is faked or stubbed as "done."

| Phase | Scope |
|---|---|
| 0 (this delivery) | Architecture, ERD/schema, folder structure, design tokens, auth architecture doc, `.env.example`, project scaffold — **for approval** |
| 1 | Prisma schema + migrations + seed data; Next.js app skeleton (layouts, nav shells for public/member/admin); design-system primitives |
| 2 | Auth: register/login/OTP/email verification/session/RBAC middleware |
| 3 | Member profile CRUD (personal/family/professional/preferences) + privacy controls + profile completion |
| 4 | Verification workflow (member submission + admin queue + review actions + history) |
| 5 | Countries/cities CMS + public country/city pages + homepage stats API + world map |
| 6 | Member directory (search/filter/pagination) respecting visibility |
| 7 | Professional directory + categories |
| 8 | Business directory + submission + moderation |
| 9 | Family branches + family relationships (request/confirm) + basic tree UI |
| 10 | Events (propose/approve/publish/RSVP) |
| 11 | Stories CMS (draft/publish/schedule/feature/SEO) |
| 12 | Moments (submit/moderate/feature) |
| 13 | Support requests (submit/offer help/moderate) |
| 14 | Connections (request/accept/reject/remove) + Notifications |
| 15 | Reports + moderation queue consolidation + Audit log viewer |
| 16 | Admin CMS: homepage content, nav, footer, settings modules |
| 17 | SEO pass (metadata, sitemap, robots, structured data, breadcrumbs) |
| 18 | Security hardening pass + rate limiting + accessibility pass |
| 19 | Performance pass (caching, ISR, image optimization, query/index review) |
| 20 | Production deployment checklist + documentation finalization |

Each phase ends with the previous phases still fully working — no regressions carried
forward.
