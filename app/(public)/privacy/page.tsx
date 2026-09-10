import type { Metadata } from "next";
import { getCmsPage, CmsPageBody } from "@/components/public/CmsPageContent";

export const metadata: Metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const page = await getCmsPage("privacy");
  return (
    <CmsPageBody
      title={page?.title ?? "Privacy Policy"}
      body={page?.body ?? null}
      fallback="We take your privacy seriously. Sensitive information such as your phone number, home address, and private family details are never displayed publicly by default, and you control your profile's visibility at all times. Full policy content will be published here by our community administrators."
    />
  );
}
