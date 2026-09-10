import { CountryForm } from "@/components/admin/CountryForm";

export default function NewCountryPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Add Country</h1>
      <div className="mt-6">
        <CountryForm />
      </div>
    </div>
  );
}
