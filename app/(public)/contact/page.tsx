import type { Metadata } from "next";
import { getCmsPage, CmsPageBody } from "@/components/public/CmsPageContent";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const page = await getCmsPage("contact");
  return (
    <CmsPageBody
      title={page?.title ?? "Contact Us"}
      body={page?.body ?? null}
      fallback="Contact details will be published here by our community administrators."
    />
  );
}
