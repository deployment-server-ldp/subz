import { getCurrentSession } from "@/lib/auth/session";
import { getPermissionsForUser, PERMISSIONS } from "@/lib/authz";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenNotice } from "@/components/ui/ForbiddenNotice";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReportResolveActions } from "@/components/admin/ReportResolveActions";

const TONE: Record<string, "warning" | "success" | "neutral"> = {
  OPEN: "warning",
  REVIEWING: "warning",
  RESOLVED: "success",
  DISMISSED: "neutral",
};

async function resolveTargetLabel(targetType: string, targetId: string): Promise<string> {
  switch (targetType) {
    case "PROFILE": {
      const p = await prisma.profile.findUnique({ where: { id: targetId } });
      return p ? `${p.firstName} ${p.lastName}` : "Unknown profile";
    }
    case "BUSINESS": {
      const b = await prisma.business.findUnique({ where: { id: targetId } });
      return b?.name ?? "Unknown business";
    }
    case "STORY": {
      const s = await prisma.story.findUnique({ where: { id: targetId } });
      return s?.title ?? "Unknown story";
    }
    case "EVENT": {
      const e = await prisma.event.findUnique({ where: { id: targetId } });
      return e?.name ?? "Unknown event";
    }
    case "MOMENT":
      return "Moment";
    case "SUPPORT_REQUEST": {
      const sr = await prisma.supportRequest.findUnique({ where: { id: targetId } });
      return sr?.title ?? "Unknown request";
    }
    default:
      return targetId;
  }
}

export default async function AdminReportsPage() {
  const session = await getCurrentSession();
  const permissions = await getPermissionsForUser(session!.user.id, session!.user.systemRole);
  if (!permissions.has(PERMISSIONS.MODERATE_REPORTS)) return <ForbiddenNotice />;

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: { reporter: true },
  });

  const labels = await Promise.all(reports.map((r) => resolveTargetLabel(r.targetType, r.targetId)));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Reports</h1>
      <div className="mt-6">
        {reports.length === 0 ? (
          <EmptyState title="No reports" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Target</Th>
                <Th>Reason</Th>
                <Th>Reporter</Th>
                <Th>Status</Th>
                <Th />
              </Tr>
            </Thead>
            <tbody>
              {reports.map((report, i) => (
                <Tr key={report.id}>
                  <Td>
                    {report.targetType}: {labels[i]}
                  </Td>
                  <Td>{report.reason.replaceAll("_", " ")}</Td>
                  <Td>{report.reporter.email}</Td>
                  <Td>
                    <Badge tone={TONE[report.status]}>{report.status}</Badge>
                  </Td>
                  <Td>{report.status === "OPEN" || report.status === "REVIEWING" ? <ReportResolveActions id={report.id} /> : null}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
