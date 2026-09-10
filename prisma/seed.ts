// Seed data for local development only. Every row created here is clearly
// demo/sample data (see ARCHITECTURE.md / README §"Seed Data") and must
// never be run against a production database.
//
// This is a placeholder for MVP Phase 1 (see ARCHITECTURE.md §M). It will
// seed: baseline Roles/Permissions, a Super Admin (from SEED_SUPER_ADMIN_*
// env vars), sample Countries/Cities, ProfessionalCategories,
// BusinessCategories, StoryCategories, and a handful of demo members,
// businesses, events, stories, and moments once those modules are built.

async function main() {
  console.log(
    "[seed] No seed steps implemented yet — schema and modules land in MVP Phase 1+.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
