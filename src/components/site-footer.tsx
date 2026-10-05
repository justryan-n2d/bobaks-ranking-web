import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/legal";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/methodology", label: "Methodology" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-border pt-8 text-sm text-muted-foreground">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-xl">
          <Link href="/" className="inline-flex items-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <img
              src="/brand/bobaks-logo.svg"
              alt="Bobaks Ranking"
              width={190}
              height={83}
              className="h-auto w-[150px] sm:w-[180px]"
            />
          </Link>
          <p className="mt-3 leading-6">
            Live rankings and historical trends for Roblox experiences.
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 lg:justify-end">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="font-semibold hover:text-foreground hover:underline">
              {link.label}
            </Link>
          ))}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold hover:text-foreground hover:underline">
            Contact
          </a>
        </nav>
      </div>

      <div className="mt-7 flex flex-col gap-2 border-t border-border pt-5 text-xs leading-5 sm:flex-row sm:items-start sm:justify-between">
        <div>© 2026 Bobaks Ranking</div>
        <div className="max-w-2xl sm:text-right">
          Independent fan-made analytics site. Not affiliated with Roblox Corporation.
        </div>
      </div>
    </footer>
  );
}
