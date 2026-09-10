import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";
import { getPermissionsForUser, PERMISSIONS } from "@/lib/authz";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenNotice } from "@/components/ui/ForbiddenNotice";
import { ButtonLink } from "@/components/ui/Button";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminCountriesPage() {
  const session = await getCurrentSession();
  const permissions = await getPermissionsForUser(session!.user.id, session!.user.systemRole);
  if (!permissions.has(PERMISSIONS.MANAGE_COUNTRIES_CITIES)) return <ForbiddenNotice />;

  const countries = await prisma.country.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { profiles: true, cities: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Countries</h1>
        <ButtonLink href="/admin/countries/new" size="sm">
          Add Country
        </ButtonLink>
      </div>

      <div className="mt-6">
        {countries.length === 0 ? (
          <EmptyState title="No countries yet" description="Add the first country to enable regional communities." />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Members</Th>
                <Th>Cities</Th>
                <Th />
              </Tr>
            </Thead>
            <tbody>
              {countries.map((country) => (
                <Tr key={country.id}>
                  <Td>{country.name}</Td>
                  <Td>{country._count.profiles}</Td>
                  <Td>{country._count.cities}</Td>
                  <Td>
                    <Link href={`/admin/countries/${country.id}`} className="text-accent hover:underline">
                      Edit
                    </Link>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
