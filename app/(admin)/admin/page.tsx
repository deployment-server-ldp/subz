import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminDashboardPage() {
  const [
    totalMembers,
    verifiedMembers,
    pendingVerification,
    countries,
    cities,
    professionals,
    businesses,
    events,
    stories,
    moments,
    supportRequests,
    openReports,
    recentLogs,
  ] = await Promise.all([
    prisma.profile.count(),
    prisma.profile.count({ where: { verificationStatus: "VERIFIED" } }),
    prisma.verificationRequest.count({ where: { status: { in: ["PENDING", "UNDER_REVIEW", "MORE_INFO_REQUESTED"] } } }),
    prisma.country.count(),
    prisma.city.count(),
    prisma.profile.count({ where: { professionalCategories: { some: {} } } }),
    prisma.business.count(),
    prisma.event.count(),
    prisma.story.count({ where: { deletedAt: null } }),
    prisma.moment.count({ where: { deletedAt: null } }),
    prisma.supportRequest.count(),
    prisma.report.count({ where: { status: { in: ["OPEN", "REVIEWING"] } } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { actor: true } }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Members" value={totalMembers} />
        <StatCard label="Verified Members" value={verifiedMembers} />
        <StatCard label="Pending Verification" value={pendingVerification} />
        <StatCard label="Countries" value={countries} />
        <StatCard label="Cities" value={cities} />
        <StatCard label="Professionals" value={professionals} />
        <StatCard label="Businesses" value={businesses} />
        <StatCard label="Events" value={events} />
        <StatCard label="Stories" value={stories} />
        <StatCard label="Moments" value={moments} />
        <StatCard label="Support Requests" value={supportRequests} />
        <StatCard label="Open Reports" value={openReports} />
      </div>

      {pendingVerification > 0 || openReports > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Needs Attention</CardTitle>
          </CardHeader>
          <div className="flex flex-wrap gap-4 text-sm">
            {pendingVerification > 0 ? (
              <Link href="/admin/verification" className="text-accent hover:underline">
                {pendingVerification} verification request(s) waiting
              </Link>
            ) : null}
            {openReports > 0 ? (
              <Link href="/admin/reports" className="text-accent hover:underline">
                {openReports} report(s) open
              </Link>
            ) : null}
          </div>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        {recentLogs.length === 0 ? (
          <EmptyState title="No activity yet" />
        ) : (
          <ul className="space-y-2 text-sm">
            {recentLogs.map((log) => (
              <li key={log.id} className="flex justify-between border-b border-border pb-2 last:border-b-0">
                <span>
                  <span className="font-medium">{log.actor.email}</span> — {log.action}
                </span>
                <span className="text-muted-foreground">{log.createdAt.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
