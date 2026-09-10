# SUBZWARI GLOBAL NETWORK — Database Design

Implemented in `prisma/schema.prisma` (PostgreSQL). This document is the narrative ERD:
entities, relationships, and the reasoning behind key design choices.

## Conventions

- Primary keys: UUID (`@default(uuid())`).
- Every table: `createdAt`, `updatedAt`. Most user-facing content tables also carry
  `deletedAt` for soft delete (members, profiles, businesses, events, stories, moments,
  support requests) so moderation/undo and audit history remain intact.
- Enums are used for closed sets (status, visibility, role, relationship type, category
  kind) so invalid states are impossible at the DB layer.
- Foreign keys use `onDelete: Restrict` by default for anything that would silently orphan
  moderation/audit history; `Cascade` only for true child records (e.g. `EventAttendee` rows
  when an `Event` is hard-deleted, which in practice never happens due to soft delete).

## Entity Groups

### Identity & Access
- **User** — auth identity: email, password hash, role, account status, email-verified flag.
- **Session**, **Account** (NextAuth-compatible) — session + OAuth linkage.
- **VerificationOtp** — hashed OTP codes, expiry, purpose (login/register/reset).
- **Role**, **Permission**, **RolePermission** — configurable RBAC on top of the baseline
  `SystemRole` enum every `User` also carries (defense in depth: enum for hard gates like
  admin-area access, table-driven permissions for fine-grained actions).
- **RegionalAssignment** — links a Regional Coordinator `User` to a `Country`/`Region` they
  can manage.

### Profile & Family
- **Profile** — one-to-one with `User`. Personal info, professional info, non-sensitive
  family free-text fields, visibility, community preference flags, profile-completion is
  computed, not stored.
- **FamilyBranch** — named lineage grouping.
- **FamilyBranchMembership** — member's requested/approved association to a branch
  (status: PENDING/APPROVED/REJECTED).
- **FamilyRelationship** — directed edge between two `Profile`s with `relationshipType`,
  `visibility`, and `status` (PENDING/CONFIRMED/DECLINED). See `ARCHITECTURE.md` §K for why
  this shape was chosen over fixed parent/child columns.

### Geography
- **Country** — name, slug, ISO code, flag/cover image, summary, order.
- **Region** — optional grouping within a country (state/province) used by regional
  coordinators.
- **City** — belongs to a `Country`, optional `Region`.

All three are admin-managed tables, never hardcoded, and drive the world map, country
pages, city pages, and directory filters.

### Professional & Business
- **ProfessionalCategory** — admin-managed (Business, Technology, Finance, …).
- Professional info itself lives on `Profile` (profession, jobTitle, company, industry,
  skills, education, university, linkedin, website) rather than a separate 1:1 table, since
  MVP treats "professional profile" as a facet of the member profile, not a distinct object
  with its own lifecycle. `ProfessionalCategory` is many-to-many with `Profile` via
  `ProfileProfessionalCategory` since a member can span more than one category.
- **BusinessCategory** — admin-managed.
- **Business** — owner (`Profile`), category, geography, status (PENDING/APPROVED/
  REJECTED/SUSPENDED), logo/media, description, contact method, social links.

### Community Content
- **Event**, **EventAttendee** (RSVP status: GOING/INTERESTED/CANCELLED).
- **StoryCategory**, **Story** (type enum: MEMBER/FAMILY/HERITAGE/HISTORY/ACHIEVEMENT/
  PROFESSIONAL_JOURNEY/COMMUNITY/GLOBAL), full CMS fields (status, publishedAt,
  scheduledAt, featured, tags, SEO fields via `SeoMetadata`).
- **Moment** — media[] (via `Media`), category/type, status, featured flag.
- **SupportRequest** — category, urgency, visibility, contact preference, status.
- **SupportOffer** — a member offering help on a `SupportRequest` (kept as its own table so
  a request can receive multiple offers without conflating with connections/messaging).

### Networking
- **Connection** — symmetric relationship between two `Profile`s with `status`
  (PENDING/ACCEPTED/REJECTED/REMOVED), requester/recipient, timestamps for each transition.
- **ContactRequest** — a lightweight "request introduction / contact member" record,
  separate from `Connection`, so privacy-gated contact attempts are tracked/moderatable
  without implying a mutual connection.

### Verification & Moderation
- **VerificationRequest** — submission payload snapshot, current status
  (PENDING/UNDER_REVIEW/APPROVED/REJECTED/MORE_INFO_REQUESTED), assigned reviewer.
- **VerificationReview** — append-only history of every decision on a `VerificationRequest`
  (reviewer, decision, notes, timestamp). A request can have many reviews (resubmission
  cycles).
- **Report** — polymorphic-by-column report against a `targetType` enum + `targetId`
  (Profile/Business/Story/Moment/Event/SupportRequest), reason enum, status, resolution.
- **AuditLog** — immutable: actor (`User`), action, targetType, targetId, metadata (JSON),
  timestamp. Written by a single `lib/audit` helper so no admin mutation path can skip it.

### Notifications
- **Notification** — recipient, type enum, payload (JSON), read flag, link.

### CMS & Settings
- **SiteSetting** — key/value(JSON) store for the settings modules in §H, grouped by
  `category` (general/brand/email/registration/verification/privacy/moderation/
  notifications/seo/community).
- **Page** — generic CMS content blocks for About/History/Community-Guidelines/etc.
  (title, slug, body richtext, SEO fields).
- **NavigationItem**, **FooterItem** — admin-orderable nav/footer entries.
- **Media** — uploaded file metadata (url, mimeType, size, alt, uploadedBy) referenced by
  profiles/businesses/events/stories/moments rather than storing blobs in Postgres.
- **Category**, **Tag** — generic tagging used by Stories (and reusable by future modules)
  distinct from the purpose-built `ProfessionalCategory`/`BusinessCategory` tables, which
  need their own admin UI copy/fields.
- **SeoMetadata** — polymorphic per-entity SEO override (title, description, ogImage,
  canonical) attachable to Story/Country/City/Business/Page.

## Key Relationships (textual ERD)

```
User 1—1 Profile
User 1—* Session
User 1—* VerificationOtp
User *—* Role (via UserRole, in addition to baseline SystemRole enum on User)
Role *—* Permission (via RolePermission)
User 1—* RegionalAssignment *—1 Country
User 1—* RegionalAssignment *—1 Region

Profile *—1 Country
Profile *—1 City
Profile *—* FamilyBranch (via FamilyBranchMembership)
Profile 1—* FamilyRelationship (as fromProfile)
Profile 1—* FamilyRelationship (as toProfile)
Profile *—* ProfessionalCategory (via ProfileProfessionalCategory)

Business *—1 Profile (owner)
Business *—1 BusinessCategory
Business *—1 Country / City
Business 1—* Media

Event *—1 Profile (organizer)
Event *—1 Country / City
Event 1—* EventAttendee *—1 Profile
Event 1—* Media

Story *—1 StoryCategory
Story *—1 Profile (author)
Story *—* Tag (via StoryTag)
Story 1—1 SeoMetadata

Moment *—1 Profile (submittedBy)
Moment 1—* Media

SupportRequest *—1 Profile (requester)
SupportRequest 1—* SupportOffer *—1 Profile (helper)

Connection *—1 Profile (requester) / Profile (recipient)
ContactRequest *—1 Profile (from) / Profile (to)

VerificationRequest *—1 User
VerificationRequest 1—* VerificationReview *—1 User (reviewer)

Report *—1 User (reporter), polymorphic target (targetType + targetId)
AuditLog *—1 User (actor), polymorphic target

Notification *—1 User (recipient)

Page / Story / Country / City / Business 1—0/1 SeoMetadata
```

## Indexing Notes

- `Profile(countryId, cityId, visibility, verificationStatus)` composite index — the hot
  path for directory search.
- `Profile` skills stored as `String[]` with a GIN index for array-contains search (or a
  join table `ProfileSkill` if free-text skill search quality requires it later — schema
  keeps `skills String[]` for MVP simplicity).
- Unique indexes: `User.email`, `Country.slug`, `City(slug, countryId)`, `Story.slug`,
  `Business.slug`, `Event.slug`, `FamilyBranch.slug`.
- `AuditLog(targetType, targetId)` and `AuditLog(actorId, createdAt)` indexes for fast
  history lookups both directions.
- `Notification(recipientId, read, createdAt)` for unread-count queries.

## Privacy Enforcement at the Data Layer

- `Profile.visibility` (PUBLIC/COMMUNITY/PRIVATE) is checked in every directory/profile
  query builder in `modules/directory` and `modules/professional` — never left to the UI.
- Sensitive fields (phone, email, home address, government ID reference, private family
  notes) either don't exist on any publicly-queried model, or live in a separate
  `PrivateContactInfo` 1:1 table that is never selected by public-facing queries — a
  structural guarantee rather than a per-query discipline.
- `FamilyRelationship.visibility` is independent of `Profile.visibility` (see
  `ARCHITECTURE.md` §K).

## Future-Ready Notes (not built now, not blocked by this schema)

- **Messaging**: `Connection` already models the social graph; a `Message`/`Thread` table
  can be added referencing `Connection` without touching existing tables.
- **Advanced genealogy**: `FamilyRelationship` edges are sufficient input for a graph
  traversal/visualization layer later.
- **Multilingual**: `Page`/`Story`/`SiteSetting` can gain a `locale` column + composite
  unique key without breaking existing rows (default locale backfilled).
- **Mobile apps**: since mutations go through Route Handlers/Server Actions with Zod
  validation, exposing a stable `/api/v1/**` surface for a future mobile client is additive.
