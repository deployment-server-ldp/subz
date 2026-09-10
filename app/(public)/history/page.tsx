import type { Metadata } from "next";
import { getCmsPage, CmsPageBody } from "@/components/public/CmsPageContent";

export const metadata: Metadata = { title: "History" };

export default async function HistoryPage() {
  const page = await getCmsPage("history");
  return (
    <CmsPageBody
      title={page?.title ?? "Our History"}
      body={page?.body ?? null}
      fallback="This page will share the history and heritage of the Subzwari community. Community administrators can add this content from the admin CMS."
    />
  );
}
