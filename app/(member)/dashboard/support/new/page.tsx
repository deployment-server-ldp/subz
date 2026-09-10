import { SupportRequestForm } from "@/components/member/SupportRequestForm";

export default function NewSupportRequestPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Request Community Support</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Requests are reviewed before becoming visible to other members.
      </p>
      <div className="mt-6">
        <SupportRequestForm />
      </div>
    </div>
  );
}
