import { prisma } from "@/lib/db/prisma";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { NavItemForm } from "@/components/admin/NavFooterForm";
import { deleteNavItem } from "@/modules/cms/actions";

export default async function AdminNavigationPage() {
  const items = await prisma.navigationItem.findMany({ orderBy: { displayOrder: "asc" } });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Navigation</h1>
      <div className="mt-6">
        <NavItemForm />
      </div>
      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState title="Using default navigation" description="Add items here to override the built-in nav." />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Label</Th>
                <Th>Href</Th>
                <Th>Order</Th>
                <Th />
              </Tr>
            </Thead>
            <tbody>
              {items.map((item) => (
                <Tr key={item.id}>
                  <Td>{item.label}</Td>
                  <Td>{item.href}</Td>
                  <Td>{item.displayOrder}</Td>
                  <Td>
                    <DeleteButton action={deleteNavItem.bind(null, item.id)} confirmText="Remove this nav item?" />
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
