import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Family Heritage",
  description: "Explore Subzwari family branches and shared heritage.",
};

export default async function FamilyPage() {
  const branches = await prisma.familyBranch.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { memberships: { where: { status: "APPROVED" } } } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">Family Heritage</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Explore Subzwari family branches, shared ancestry, and community lineage.
      </p>

      <div className="mt-10">
        {branches.length === 0 ? (
          <EmptyState title="No family branches yet" description="Check back soon." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {branches.map((branch) => (
              <Link key={branch.id} href={`/family/branches/${branch.slug}`}>
                <Card className="h-full hover:border-accent">
                  <p className="font-display text-lg font-semibold">{branch.name}</p>
                  {branch.region ? <p className="text-sm text-muted-foreground">{branch.region}</p> : null}
                  <p className="mt-2 text-sm text-muted-foreground">{branch._count.memberships} members</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
