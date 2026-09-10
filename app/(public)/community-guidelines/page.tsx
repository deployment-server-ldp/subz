import type { Metadata } from "next";
import { getCmsPage, CmsPageBody } from "@/components/public/CmsPageContent";

export const metadata: Metadata = { title: "Community Guidelines" };

export default async function CommunityGuidelinesPage() {
  const page = await getCmsPage("community-guidelines");
  return (
    <CmsPageBody
      title={page?.title ?? "Community Guidelines"}
      body={page?.body ?? null}
      fallback="Our community is built on trust, respect, and shared heritage. Members are expected to provide accurate information, treat one another with respect, and use the platform in the spirit of SUBZWARI's ARE ONE. Full guidelines will be published here by our community administrators."
    />
  );
}
