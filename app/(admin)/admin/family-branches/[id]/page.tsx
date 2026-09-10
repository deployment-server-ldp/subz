import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { FamilyBranchForm } from "@/components/admin/FamilyBranchForm";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { BranchMembershipActions } from "@/components/admin/BranchMembershipActions";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminFamilyBranchDetailPage({ params }: { params: { id: string } }) {
  const branch = await prisma.familyBranch.findUnique({
    where: { id: params.id },
    include: { memberships: { include: { profile: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!branch) notFound();

  const pending = branch.memberships.filter((m) => m.status === "PENDING");
  const approved = branch.memberships.filter((m) => m.status === "APPROVED");

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Edit {branch.name}</h1>
        <div className="mt-6">
          <FamilyBranchForm
            branchId={branch.id}
            initial={{
              name: branch.name,
              description: branch.description ?? "",
              region: branch.region ?? "",
              historicalInformation: branch.historicalInformation ?? "",
            }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Association Requests ({pending.length})</CardTitle>
        </CardHeader>
        {pending.length === 0 ? (
          <EmptyState title="No pending requests" />
        ) : (
          <div className="space-y-3">
            {pending.map((membership) => (
              <div key={membership.id} className="flex items-center justify-between border-t border-border pt-3 first:border-t-0 first:pt-0">
                <span className="text-sm">
                  {membership.profile.firstName} {membership.profile.lastName}
                </span>
                <BranchMembershipActions membershipId={membership.id} />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Associated Members ({approved.length})</CardTitle>
        </CardHeader>
        {approved.length === 0 ? (
          <EmptyState title="No associated members yet" />
        ) : (
          <ul className="space-y-1 text-sm">
            {approved.map((membership) => (
              <li key={membership.id}>
                {membership.profile.firstName} {membership.profile.lastName}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
