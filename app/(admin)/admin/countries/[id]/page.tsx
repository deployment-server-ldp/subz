import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { CountryForm } from "@/components/admin/CountryForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteCountry } from "@/modules/geography/actions";

export default async function EditCountryPage({ params }: { params: { id: string } }) {
  const country = await prisma.country.findUnique({ where: { id: params.id } });
  if (!country) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Edit {country.name}</h1>
      <div className="mt-6">
        <CountryForm
          countryId={country.id}
          initial={{
            name: country.name,
            isoCode: country.isoCode ?? "",
            summary: country.summary ?? "",
            displayOrder: country.displayOrder,
          }}
        />
      </div>
      <div className="mt-8 border-t border-border pt-6">
        <DeleteButton
          action={deleteCountry.bind(null, country.id)}
          confirmText="Delete this country? It must have no members or cities."
          redirectTo="/admin/countries"
        />
      </div>
    </div>
  );
}
