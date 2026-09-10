import { SubmitMomentForm } from "@/components/member/SubmitMomentForm";

export default function NewMomentPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Share a Moment</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Moments are reviewed by our team before appearing in the community gallery.
      </p>
      <div className="mt-6">
        <SubmitMomentForm />
      </div>
    </div>
  );
}
