import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function DirectoryFilters({
  countries,
  searchParams,
  extraFields,
}: {
  countries: { id: string; name: string }[];
  searchParams: Record<string, string | string[] | undefined>;
  extraFields?: React.ReactNode;
}) {
  const get = (key: string) => (typeof searchParams[key] === "string" ? (searchParams[key] as string) : "");

  return (
    <form method="get" className="flex flex-wrap items-end gap-4 rounded border border-border p-4">
      <div className="min-w-[180px] flex-1">
        <label className="mb-1 block text-sm font-medium" htmlFor="q">
          Search
        </label>
        <Input id="q" name="q" placeholder="Name, profession, company…" defaultValue={get("q")} />
      </div>
      <div className="min-w-[160px]">
        <label className="mb-1 block text-sm font-medium" htmlFor="countryId">
          Country
        </label>
        <Select id="countryId" name="countryId" defaultValue={get("countryId")}>
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="min-w-[160px]">
        <label className="mb-1 block text-sm font-medium" htmlFor="industry">
          Industry
        </label>
        <Input id="industry" name="industry" defaultValue={get("industry")} />
      </div>
      {extraFields}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="openToNetworking" value="1" defaultChecked={get("openToNetworking") === "1"} />
        Open to networking
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="openToMentorship" value="1" defaultChecked={get("openToMentorship") === "1"} />
        Open to mentorship
      </label>
      <Button type="submit" size="sm">
        Filter
      </Button>
    </form>
  );
}
