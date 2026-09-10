import { SubmitStoryForm } from "@/components/member/SubmitStoryForm";

export default function NewStoryPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Share Your Story</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Stories are reviewed by our editorial team before publishing.
      </p>
      <div className="mt-6">
        <SubmitStoryForm />
      </div>
    </div>
  );
}
