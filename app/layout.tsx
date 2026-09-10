import type { Metadata } from "next";
import "./globals.css";
import { SessionProviderWrapper } from "@/components/providers/SessionProviderWrapper";

export const metadata: Metadata = {
  title: {
    default: "SUBZWARI GLOBAL NETWORK — SUBZWARI's ARE ONE",
    template: "%s | SUBZWARI GLOBAL NETWORK",
  },
  description:
    "Connecting Subzwari families, professionals and communities across the world. One Name. One Community. One Network.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
