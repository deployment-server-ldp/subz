import type { Metadata } from "next";
import { getCmsPage, CmsPageBody } from "@/components/public/CmsPageContent";

export const metadata: Metadata = { title: "Terms of Service" };

export default async function TermsPage() {
  const page = await getCmsPage("terms");
  return (
    <CmsPageBody
      title={page?.title ?? "Terms of Service"}
      body={page?.body ?? null}
      fallback="Terms of service content will be published here by our community administrators."
    />
  );
}
