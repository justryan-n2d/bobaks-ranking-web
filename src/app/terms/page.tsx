import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CONTACT_EMAIL, LEGAL_VERSIONS } from "@/lib/legal";

export const metadata = {
  alternates: { canonical: "/terms" },
  title: "Terms",
  description: "Terms and Conditions for using Bobaks Ranking.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Home
      </Link>

      <header>
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Information</div>
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Terms and Conditions</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Version {LEGAL_VERSIONS.terms} · Last updated October 6, 2026
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>1. Using Bobaks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            Bobaks Ranking is an independent fan-made analytics service for exploring Roblox experience rankings, player-count trends, historical data, and related discovery features.
          </p>
          <p>
            You may browse public ranking information without an account. An account is optional and is used for features such as synced watchlists, alerts, saved comparisons, and account preferences.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Data and availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            Bobaks rankings are calculated from data collected from Roblox public experience data and from Bobaks' own historical collection. Rankings represent the information Bobaks has successfully collected and qualified, not every moment of gameplay.
          </p>
          <p>
            Data can change as new collection cycles arrive. Roblox rate limits, outages, discovery gaps, inactive experiences, or other technical issues can affect what Bobaks is able to record.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            You are responsible for keeping your account credentials secure. You must not use another person's account or attempt to bypass access controls.
          </p>
          <p>
            Bobaks may limit, suspend, or remove access when necessary to protect the service, its users, or its infrastructure, or when an account is used abusively.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Optional Roblox connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            Connecting a Roblox identity is optional. Bobaks keeps a Bobaks account separate from a Roblox identity and only uses the connection for features that require it.
          </p>
          <p>
            You can disconnect an available Roblox identity connection from your account settings.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Intellectual property and independence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            Bobaks' original software, interface, branding, written content, and analytics presentation belong to their respective rights holders. Roblox and Roblox-related names, marks, and content belong to their respective owners.
          </p>
          <p>
            Bobaks is not operated by, sponsored by, endorsed by, or officially affiliated with Roblox Corporation.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Acceptable use</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-7 text-muted-foreground">
          You must not abuse the service, interfere with its operation, attempt unauthorized access, scrape or overload endpoints in a way that harms the service, or use Bobaks to facilitate unlawful activity.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. No warranty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            Bobaks is provided on an as-available basis. No guarantee is made that every ranking, player count, peak record, historical point, or other data value will always be complete, current, or error-free.
          </p>
          <p>
            You are responsible for how you use information shown by Bobaks.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Changes to these terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            Bobaks may update these Terms and Conditions as the service changes. A materially updated version will be published on this page with a new version date.
          </p>
          <p>
            Where required, you may be asked to accept the updated terms before continuing to use account features.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. Contact</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-7 text-muted-foreground">
          Questions about these Terms can be sent to{" "}
          <a className="font-semibold text-foreground hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>.
        </CardContent>
      </Card>
    </div>
  );
}
