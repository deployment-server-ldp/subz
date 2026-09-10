import { prisma } from "@/lib/db/prisma";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { FooterItemForm } from "@/components/admin/NavFooterForm";
import { deleteFooterItem } from "@/modules/cms/actions";

export default async function AdminFooterPage() {
  const items = await prisma.footerItem.findMany({ orderBy: [{ section: "asc" }, { displayOrder: "asc" }] });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Footer</h1>
      <div className="mt-6">
        <FooterItemForm />
      </div>
      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState title="Using default footer" description="Add items here to override the built-in footer." />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Section</Th>
                <Th>Label</Th>
                <Th>Href</Th>
                <Th />
              </Tr>
            </Thead>
            <tbody>
              {items.map((item) => (
                <Tr key={item.id}>
                  <Td>{item.section}</Td>
                  <Td>{item.label}</Td>
                  <Td>{item.href}</Td>
                  <Td>
                    <DeleteButton action={deleteFooterItem.bind(null, item.id)} confirmText="Remove this footer item?" />
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
