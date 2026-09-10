// Seed data for local development only. Every row created here is clearly
// demo/sample data (see README.md §"Seed Data") and must never be run
// against a production database.

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";
import { ALL_PERMISSIONS, PERMISSIONS } from "../lib/authz";
import { slugify, uniqueSlug } from "../lib/slug";

const prisma = new PrismaClient();

const PERMISSION_LABELS: Record<string, string> = {
  [PERMISSIONS.MANAGE_ADMINS_ROLES]: "Manage Admins & Roles",
  [PERMISSIONS.MANAGE_SETTINGS]: "Manage Settings",
  [PERMISSIONS.MANAGE_MEMBERS]: "Manage Members",
  [PERMISSIONS.REVIEW_VERIFICATION]: "Review Verification",
  [PERMISSIONS.MANAGE_FAMILY_BRANCHES]: "Manage Family Branches",
  [PERMISSIONS.MANAGE_COUNTRIES_CITIES]: "Manage Countries & Cities",
  [PERMISSIONS.MANAGE_STORIES_MOMENTS]: "Manage Stories & Moments",
  [PERMISSIONS.MANAGE_EVENTS]: "Manage Events",
  [PERMISSIONS.MANAGE_BUSINESSES]: "Manage Businesses",
  [PERMISSIONS.MODERATE_REPORTS]: "Moderate Reports",
  [PERMISSIONS.MODERATE_CONTENT_QUEUE]: "Moderate Content Queue",
  [PERMISSIONS.VIEW_AUDIT_LOGS]: "View Audit Logs",
};

async function seedPermissions() {
  for (const key of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key },
      create: { key, name: PERMISSION_LABELS[key] ?? key },
      update: {},
    });
  }
  console.log(`[seed] ${ALL_PERMISSIONS.length} permissions ready`);
}

async function seedSuperAdmin() {
  const email = process.env.SEED_SUPER_ADMIN_EMAIL;
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("[seed] SEED_SUPER_ADMIN_EMAIL/PASSWORD not set — skipping Super Admin bootstrap");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`[seed] Super Admin ${email} already exists`);
    return;
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      systemRole: "SUPER_ADMIN",
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          firstName: "Super",
          lastName: "Admin",
          slug: uniqueSlug("super-admin"),
          visibility: "PRIVATE",
          verificationStatus: "VERIFIED",
        },
      },
    },
  });
  console.log(`[seed] Super Admin created: ${email}`);
}

const COUNTRIES: { name: string; isoCode: string; cities: string[] }[] = [
  { name: "Pakistan", isoCode: "PK", cities: ["Karachi", "Lahore", "Islamabad"] },
  { name: "United Arab Emirates", isoCode: "AE", cities: ["Dubai", "Abu Dhabi"] },
  { name: "United Kingdom", isoCode: "GB", cities: ["London", "Manchester"] },
  { name: "United States", isoCode: "US", cities: ["New York", "Houston"] },
  { name: "Canada", isoCode: "CA", cities: ["Toronto", "Vancouver"] },
  { name: "India", isoCode: "IN", cities: ["Mumbai", "Delhi"] },
  { name: "Saudi Arabia", isoCode: "SA", cities: ["Riyadh", "Jeddah"] },
  { name: "Australia", isoCode: "AU", cities: ["Sydney", "Melbourne"] },
];

async function seedGeography() {
  const cityIdsByName = new Map<string, string>();
  for (const [i, country] of COUNTRIES.entries()) {
    const countryRow = await prisma.country.upsert({
      where: { slug: slugify(country.name) },
      create: {
        name: country.name,
        slug: slugify(country.name),
        isoCode: country.isoCode,
        displayOrder: i,
        summary: `The Subzwari community in ${country.name}.`,
      },
      update: {},
    });
    for (const cityName of country.cities) {
      const city = await prisma.city.upsert({
        where: { countryId_slug: { countryId: countryRow.id, slug: slugify(cityName) } },
        create: { name: cityName, slug: slugify(cityName), countryId: countryRow.id },
        update: {},
      });
      cityIdsByName.set(cityName, city.id);
    }
  }
  console.log(`[seed] ${COUNTRIES.length} countries seeded`);
  return cityIdsByName;
}

const PROFESSIONAL_CATEGORIES = [
  "Business",
  "Technology",
  "Finance",
  "Healthcare",
  "Law",
  "Education",
  "Engineering",
  "Marketing",
  "Real Estate",
  "Manufacturing",
  "Other",
];

const BUSINESS_CATEGORIES = [
  "Business",
  "Technology",
  "Healthcare",
  "Finance",
  "Law",
  "Education",
  "Engineering",
  "Marketing",
  "Design",
  "Real Estate",
  "Logistics",
  "Manufacturing",
  "Media",
  "Government",
  "Other",
];

const STORY_CATEGORIES = [
  "Member Stories",
  "Family Stories",
  "Heritage",
  "History",
  "Achievements",
  "Professional Journeys",
  "Community Stories",
  "Global Subzwari Stories",
];

async function seedCategories() {
  for (const [i, name] of PROFESSIONAL_CATEGORIES.entries()) {
    await prisma.professionalCategory.upsert({
      where: { slug: slugify(name) },
      create: { name, slug: slugify(name), displayOrder: i },
      update: {},
    });
  }
  for (const [i, name] of BUSINESS_CATEGORIES.entries()) {
    await prisma.businessCategory.upsert({
      where: { slug: slugify(name) },
      create: { name, slug: slugify(name), displayOrder: i },
      update: {},
    });
  }
  for (const name of STORY_CATEGORIES) {
    await prisma.storyCategory.upsert({
      where: { slug: slugify(name) },
      create: { name, slug: slugify(name) },
      update: {},
    });
  }
  console.log("[seed] categories seeded");
}

const DEMO_MEMBERS = [
  { firstName: "Ahmed", lastName: "Subzwari", city: "Dubai", profession: "Entrepreneur", category: "Business" },
  { firstName: "Fatima", lastName: "Subzwari", city: "Karachi", profession: "Physician", category: "Healthcare" },
  { firstName: "Bilal", lastName: "Subzwari", city: "London", profession: "Software Engineer", category: "Technology" },
  { firstName: "Ayesha", lastName: "Subzwari", city: "Toronto", profession: "Lawyer", category: "Law" },
  { firstName: "Usman", lastName: "Subzwari", city: "New York", profession: "Investment Banker", category: "Finance" },
  { firstName: "Sana", lastName: "Subzwari", city: "Sydney", profession: "University Professor", category: "Education" },
];

async function seedDemoMembers(cityIdsByName: Map<string, string>) {
  const professionalCategories = await prisma.professionalCategory.findMany();
  const profileIds: string[] = [];

  for (const member of DEMO_MEMBERS) {
    const email = `${slugify(member.firstName)}.${slugify(member.lastName)}@demo.subzwari.example`;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) continue;

    const cityId = cityIdsByName.get(member.city);
    const city = cityId ? await prisma.city.findUnique({ where: { id: cityId } }) : null;
    const category = professionalCategories.find((c) => c.name === member.category);
    const passwordHash = await hashPassword("Demo1234!");

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        emailVerifiedAt: new Date(),
        profile: {
          create: {
            firstName: member.firstName,
            lastName: member.lastName,
            slug: uniqueSlug(`${member.firstName}-${member.lastName}`),
            countryId: city?.countryId,
            cityId: city?.id,
            profession: member.profession,
            bio: `${member.firstName} is a proud member of the Subzwari global community, working as a ${member.profession.toLowerCase()} in ${member.city}.`,
            visibility: "PUBLIC",
            verificationStatus: "VERIFIED",
            isIndexable: true,
            openToNetworking: true,
            professionalCategories: category ? { create: [{ categoryId: category.id }] } : undefined,
          },
        },
      },
      include: { profile: true },
    });
    if (user.profile) profileIds.push(user.profile.id);
  }
  console.log(`[seed] ${profileIds.length} demo members created`);
  return profileIds;
}

async function seedDemoContent(profileIds: string[]) {
  if (profileIds.length === 0) return;
  const [ownerId, authorId] = profileIds;

  const businessCategory = await prisma.businessCategory.findFirst({ where: { name: "Business" } });
  const owner = await prisma.profile.findUnique({ where: { id: ownerId } });
  if (businessCategory && owner?.countryId) {
    const businessName = `${owner.firstName}'s Trading Co.`;
    await prisma.business.upsert({
      where: { slug: slugify(businessName) },
      create: {
        name: businessName,
        slug: slugify(businessName),
        ownerId,
        categoryId: businessCategory.id,
        countryId: owner.countryId,
        cityId: owner.cityId,
        description: "A demo business listing showcasing the SUBZWARI Business Directory.",
        status: "APPROVED",
      },
      update: {},
    });
  }

  const storyCategory = await prisma.storyCategory.findFirst({ where: { name: "Community Stories" } });
  await prisma.story.upsert({
    where: { slug: "welcome-to-subzwari-global-network" },
    create: {
      title: "Welcome to SUBZWARI Global Network",
      slug: "welcome-to-subzwari-global-network",
      excerpt: "A new home for Subzwari families, professionals, and communities worldwide.",
      body: "SUBZWARI's ARE ONE. This platform connects Subzwari families, professionals and communities across the world — preserving heritage, building professional relationships, and supporting one another as a global community.",
      type: "GLOBAL",
      categoryId: storyCategory?.id,
      authorId,
      status: "PUBLISHED",
      featured: true,
      publishedAt: new Date(),
    },
    update: {},
  });

  if (owner?.countryId) {
    await prisma.event.upsert({
      where: { slug: "global-subzwari-meetup" },
      create: {
        name: "Global Subzwari Meetup",
        slug: "global-subzwari-meetup",
        description: "An online meetup for Subzwari members to connect across borders.",
        startsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        organizerId: ownerId,
        countryId: owner.countryId,
        cityId: owner.cityId,
        status: "PUBLISHED",
      },
      update: {},
    });
  }

  await prisma.familyBranch.upsert({
    where: { slug: "subzwari-main-lineage" },
    create: {
      name: "Subzwari Main Lineage",
      slug: "subzwari-main-lineage",
      description: "The primary Subzwari family lineage, open to all members tracing their roots.",
      region: "South Asia",
    },
    update: {},
  });

  console.log("[seed] demo business, story, event, and family branch created");
}

const CMS_PAGES: { slug: string; title: string; body: string }[] = [
  {
    slug: "about",
    title: "About SUBZWARI Global Network",
    body: "SUBZWARI Global Network is a global digital community and family network for people who identify as Subzwari — connecting members worldwide, preserving family heritage, enabling professional networking, and supporting community events and stories.\n\nOne Name. One Community. One Network.",
  },
  {
    slug: "community-guidelines",
    title: "Community Guidelines",
    body: "Our community is built on trust, respect, and shared heritage. Members are expected to provide accurate information, treat one another with respect, and use the platform in the spirit of SUBZWARI's ARE ONE.",
  },
  {
    slug: "verification",
    title: "How Verification Works",
    body: "Verification helps keep SUBZWARI Global Network a trusted community. Complete your profile, submit your verification request, and our community team will review it — no government documents required by default.",
  },
];

async function seedCmsPages() {
  for (const page of CMS_PAGES) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      create: { ...page, status: "PUBLISHED" },
      update: {},
    });
  }
  console.log(`[seed] ${CMS_PAGES.length} CMS pages seeded`);
}

async function main() {
  await seedPermissions();
  await seedSuperAdmin();
  const cityIdsByName = await seedGeography();
  await seedCategories();
  const profileIds = await seedDemoMembers(cityIdsByName);
  await seedDemoContent(profileIds);
  await seedCmsPages();
  console.log("[seed] done");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
