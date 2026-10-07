import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CONTACT_EMAIL, LEGAL_VERSIONS } from "@/lib/legal";

export const metadata = {
  alternates: { canonical: "/privacy" },
  title: "Privacy",
  description: "Bobaks Ranking Privacy Policy.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Home
      </Link>

      <header>
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Information</div>
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Version {LEGAL_VERSIONS.privacy} · Last updated October 6, 2026
        </p>
      </header>

      <Card>
        <CardHeader><CardTitle>1. What Bobaks collects</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>Bobaks collects information needed to provide the features you choose to use.</p>
          <p>
            For an account, this can include your email address, optional display name, public-profile preference, alert preferences, watchlist entries, saved comparisons, and account security information managed by the authentication system.
          </p>
          <p>
            A Roblox identity connection is optional. When connected, Bobaks may store the Roblox user ID, provider subject, username, display name, profile URL, avatar URL, connection status, and verification timestamps needed to maintain that connection.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>2. Why this information is used</CardTitle></CardHeader>
        <CardContent className="text-sm leading-7 text-muted-foreground">
          We use account information to authenticate you, keep your settings, sync selected data across devices, deliver account features you enable, protect the service, and operate the features described on Bobaks.
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>3. Public profiles</CardTitle></CardHeader>
        <CardContent className="text-sm leading-7 text-muted-foreground">
          Public profile visibility is optional. A profile marked public may be shown on future community surfaces. Bobaks keeps Roblox identity visibility separately controlled through explicit account preferences.
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>4. Cookies and browser storage</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            Bobaks uses browser storage for session state and guest watchlist data. Guest watchlists remain on the device and do not require an account.
          </p>
          <p>
            The Google authentication flow also uses a short-lived secure transaction cookie to complete PKCE authentication.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>5. Retention and deletion</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            Account data is kept for as long as needed to provide the account features you use, maintain security, and meet applicable obligations. Data that is no longer needed may be deleted or anonymized according to Bobaks' operational requirements.
          </p>
          <p>
            You can contact Bobaks to request account-data assistance or ask questions about how your information is handled.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>6. Data sharing</CardTitle></CardHeader>
        <CardContent className="text-sm leading-7 text-muted-foreground">
          Bobaks does not sell your account information. Some service providers may process data on Bobaks' behalf when necessary to provide authentication, hosting, infrastructure, or other site functionality.
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>7. Security</CardTitle></CardHeader>
        <CardContent className="text-sm leading-7 text-muted-foreground">
          Bobaks uses access controls, authenticated requests, database row-level security, and other technical safeguards appropriate to the service. No internet service can guarantee absolute security.
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>8. Your choices</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            You can browse public rankings without creating an account. Account users can manage profile visibility, alerts, watchlists, saved comparisons, and optional Roblox identity visibility from the account area.
          </p>
          <p>
            Privacy questions or requests can be sent to{" "}
            <a className="font-semibold text-foreground hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>9. Changes to this policy</CardTitle></CardHeader>
        <CardContent className="text-sm leading-7 text-muted-foreground">
          Updates will be published on this page with a new version date. Where required, Bobaks may ask account users to acknowledge a materially updated policy.
        </CardContent>
      </Card>
    </div>
  );
}
