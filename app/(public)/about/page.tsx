import type { Metadata } from "next";
import { getCmsPage, CmsPageBody } from "@/components/public/CmsPageContent";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const page = await getCmsPage("about");
  return (
    <CmsPageBody
      title={page?.title ?? "About SUBZWARI Global Network"}
      body={page?.body ?? null}
      fallback="SUBZWARI Global Network is a global digital community and family network for people who identify as Subzwari — connecting members worldwide, preserving family heritage, enabling professional networking, and supporting community events and stories. One Name. One Community. One Network."
    />
  );
}
