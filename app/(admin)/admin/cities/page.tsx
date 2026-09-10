import { getCurrentSession } from "@/lib/auth/session";
import { getPermissionsForUser, PERMISSIONS } from "@/lib/authz";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenNotice } from "@/components/ui/ForbiddenNotice";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { CityForm } from "@/components/admin/CityForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteCity } from "@/modules/geography/actions";

export default async function AdminCitiesPage() {
  const session = await getCurrentSession();
  const permissions = await getPermissionsForUser(session!.user.id, session!.user.systemRole);
  if (!permissions.has(PERMISSIONS.MANAGE_COUNTRIES_CITIES)) return <ForbiddenNotice />;

  const [cities, countries] = await Promise.all([
    prisma.city.findMany({
      orderBy: { name: "asc" },
      include: { country: true, _count: { select: { profiles: true } } },
    }),
    prisma.country.findMany({ orderBy: { displayOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Cities</h1>
      <div className="mt-6 rounded border border-border p-4">
        <CityForm countries={countries} />
      </div>

      <div className="mt-6">
        {cities.length === 0 ? (
          <EmptyState title="No cities yet" description="Add cities to your countries above." />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>City</Th>
                <Th>Country</Th>
                <Th>Members</Th>
                <Th />
              </Tr>
            </Thead>
            <tbody>
              {cities.map((city) => (
                <Tr key={city.id}>
                  <Td>{city.name}</Td>
                  <Td>{city.country.name}</Td>
                  <Td>{city._count.profiles}</Td>
                  <Td>
                    <DeleteButton action={deleteCity.bind(null, city.id)} confirmText="Delete this city?" />
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
