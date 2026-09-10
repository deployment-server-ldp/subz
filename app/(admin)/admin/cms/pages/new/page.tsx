import { PageForm } from "@/components/admin/PageForm";

export default function NewCmsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">New Page</h1>
      <div className="mt-6">
        <PageForm />
      </div>
    </div>
  );
}
