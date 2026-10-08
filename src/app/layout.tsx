import type { Metadata } from "next";
import { AuthProvider } from "@/components/account-provider";
import { SiteShell } from "@/components/site-shell";
import { isDemoModeEnabled } from "@/lib/demo-data";
import "./globals.css";

const SITE_ORIGIN = (process.env.BOBAKS_SITE_ORIGIN || "https://web.bobaksranking.workers.dev").replace(/\/$/, "");
const IS_PREVIEW = process.env.BOBAKS_DEPLOYMENT_ENV === "preview";
const BING_SITE_VERIFICATION = process.env.BING_SITE_VERIFICATION?.trim();

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
  ...(!IS_PREVIEW && BING_SITE_VERIFICATION
    ? {
        verification: {
          other: { "msvalidate.01": BING_SITE_VERIFICATION },
        },
      }
    : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {!IS_PREVIEW ? (
        <meta
          name="google-site-verification"
          content="sUJWU9x32VR0FEnIqkOXVa76kUGKqjTllt-_0ZLiSOA"
        />
      ) : null}
      <AuthProvider>
        <SiteShell demoMode={isDemoModeEnabled()}>{children}</SiteShell>
      </AuthProvider>
    </>
  );
}
