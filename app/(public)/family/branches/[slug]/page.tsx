import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { RequestBranchButton } from "@/components/public/RequestBranchButton";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const branch = await prisma.familyBranch.findUnique({ where: { slug: params.slug } });
  if (!branch) return {};
  return { title: branch.name, description: branch.description ?? undefined };
}

export default async function FamilyBranchDetailPage({ params }: { params: { slug: string } }) {
  const session = await getCurrentSession();
  const branch = await prisma.familyBranch.findUnique({
    where: { slug: params.slug },
    include: {
      memberships: {
        where: { status: "APPROVED", profile: { verificationStatus: "VERIFIED", visibility: { in: ["PUBLIC", "COMMUNITY"] } } },
        include: { profile: true },
      },
    },
  });
  if (!branch) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">{branch.name}</h1>
      {branch.region ? <p className="mt-1 text-muted-foreground">{branch.region}</p> : null}

      {branch.description ? <p className="mt-4 text-muted-foreground">{branch.description}</p> : null}

      {branch.historicalInformation ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <p className="text-sm text-muted-foreground">{branch.historicalInformation}</p>
        </Card>
      ) : null}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Associated Members ({branch.memberships.length})</CardTitle>
        </CardHeader>
        {branch.memberships.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members have publicly associated with this branch yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {branch.memberships.map((m) => (
              <li key={m.id}>
                <a href={`/members/${m.profile.slug}`} className="text-accent hover:underline">
                  {m.profile.firstName} {m.profile.lastName}
                </a>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {session?.user ? (
        <div className="mt-6">
          <RequestBranchButton branchId={branch.id} />
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          <a href="/login" className="text-accent hover:underline">
            Sign in
          </a>{" "}
          to request association with this branch.
        </p>
      )}
    </div>
  );
}
