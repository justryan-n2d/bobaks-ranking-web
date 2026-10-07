import type { Metadata } from "next";
import { AuthProvider } from "@/components/account-provider";
import { SiteShell } from "@/components/site-shell";
import { isDemoModeEnabled } from "@/lib/demo-data";
import "./globals.css";

const SITE_ORIGIN = (process.env.BOBAKS_SITE_ORIGIN || "https://web.bobaksranking.workers.dev").replace(/\/$/, "");
const IS_PREVIEW = process.env.BOBAKS_DEPLOYMENT_ENV === "preview";

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
  icons: {
    icon: "/icon.svg",
  },
  robots: {
    index: !IS_PREVIEW,
    follow: !IS_PREVIEW,
  },
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
