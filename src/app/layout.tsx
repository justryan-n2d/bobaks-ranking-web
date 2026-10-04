import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { isDemoModeEnabled } from "@/lib/demo-data";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://bobaksranking.com"),
  title: {
    default: "Bobaks Ranking",
    template: "%s | Bobaks Ranking",
  },
  description: "Live rankings and historical trends for Roblox experiences.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteShell demoMode={isDemoModeEnabled()}>{children}</SiteShell>
      </body>
    </html>
  );
}
