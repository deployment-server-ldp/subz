import { FamilyBranchForm } from "@/components/admin/FamilyBranchForm";

export default function NewFamilyBranchPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Add Family Branch</h1>
      <div className="mt-6">
        <FamilyBranchForm />
      </div>
    </div>
  );
}
