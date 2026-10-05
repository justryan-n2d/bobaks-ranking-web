import type { Metadata } from "next";
import { AuthProvider } from "@/components/account-provider";
import { SiteShell } from "@/components/site-shell";
import { isDemoModeEnabled } from "@/lib/demo-data";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://bobaksranking.com"),
  title: {
    default: "Bobaks Ranking",
    template: "%s | Bobaks Ranking",
  },
  description: "Live rankings and historical trends for Roblox experiences.",
  icons: {
    icon: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
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
