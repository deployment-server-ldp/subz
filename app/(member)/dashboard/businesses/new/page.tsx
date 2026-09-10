import { prisma } from "@/lib/db/prisma";
import { BusinessForm } from "@/components/member/BusinessForm";

export default async function NewBusinessPage() {
  const [categories, countries] = await Promise.all([
    prisma.businessCategory.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.country.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Add Business</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your listing will be reviewed by our team before it appears publicly.
      </p>
      <div className="mt-6">
        <BusinessForm categories={categories} countries={countries} />
      </div>
    </div>
  );
}
