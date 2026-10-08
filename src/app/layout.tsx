import type { Metadata } from "next";
import { AuthProvider } from "@/components/account-provider";
import { SiteShell } from "@/components/site-shell";
import { isDemoModeEnabled } from "@/lib/demo-data";
import "./globals.css";

const SITE_ORIGIN = (process.env.BOBAKS_SITE_ORIGIN || "https://web.bobaksranking.workers.dev").replace(/\/$/, "");
const IS_PREVIEW = process.env.BOBAKS_DEPLOYMENT_ENV === "preview";
const BING_SITE_VERIFICATION = process.env.BING_SITE_VERIFICATION?.trim();
const GOOGLE_SITE_VERIFICATION = "95wMN3wqzeI4-1F8c8l3s_bXFlXtjj1kXK1oGR7aT1o";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Bobaks Ranking",
    template: "%s | Bobaks Ranking",
  },
  description: "Live rankings and historical trends for Roblox experiences.",
  openGraph: {
    type: "website",
    siteName: "Bobaks Ranking",
    title: "Bobaks Ranking",
    description: "Live rankings and historical trends for Roblox experiences.",
  },
  twitter: {
    card: "summary",
    title: "Bobaks Ranking",
    description: "Live rankings and historical trends for Roblox experiences.",
  },
  icons: {
    icon: "/icon.svg",
  },
  robots: {
    index: !IS_PREVIEW,
    follow: !IS_PREVIEW,
  },
  ...(!IS_PREVIEW
    ? {
        verification: {
          google: GOOGLE_SITE_VERIFICATION,
          ...(BING_SITE_VERIFICATION
            ? { other: { "msvalidate.01": BING_SITE_VERIFICATION } }
            : {}),
        },
      }
    : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SiteShell demoMode={isDemoModeEnabled()}>{children}</SiteShell>
        </AuthProvider>
      </body>
    </html>
  );
}
