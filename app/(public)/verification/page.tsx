import type { Metadata } from "next";
import { getCmsPage, CmsPageBody } from "@/components/public/CmsPageContent";

export const metadata: Metadata = { title: "Verification" };

export default async function VerificationInfoPage() {
  const page = await getCmsPage("verification");
  return (
    <CmsPageBody
      title={page?.title ?? "How Verification Works"}
      body={page?.body ?? null}
      fallback={
        "Verification helps keep SUBZWARI Global Network a trusted community.\n\n" +
        "1. Complete your profile with personal and family information.\n" +
        "2. Submit your verification request from your dashboard — no government documents required by default.\n" +
        "3. Our community team reviews your submission.\n" +
        "4. You'll be notified of the decision: verified, rejected, or asked for more information.\n\n" +
        "Verified members receive a badge and appear in the community directory (subject to their own privacy settings)."
      }
    />
  );
}
