import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { RankingPeriodView } from "@/components/ranking-period-view";
import type { RankingPeriod } from "@/lib/api";
import { RANKING_PERIOD_META, RANKING_PERIODS } from "@/lib/ranking";

const SITE_ORIGIN = (
  process.env.BOBAKS_SITE_ORIGIN || "https://web.bobaksranking.workers.dev"
).replace(/\/$/, "");

export async function generateMetadata({ params }: { params: Promise<{ period: string }> }): Promise<Metadata> {
  const { period } = await params;
  const meta = RANKING_PERIOD_META[period as RankingPeriod];
  if (!meta) {
    return {
      title: "Rankings",
      robots: { index: false, follow: false },
    };
  }

  const title = meta.label + " Roblox Game Rankings";
  const description = meta.description + " Bobaks Ranking.";
  const canonicalPath = "/rankings/" + period;

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "website",
      siteName: "Bobaks Ranking",
      title,
      description,
      url: canonicalPath,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function RankingPeriodPage({ params }: { params: Promise<{ period: string }> }) {
  const { period: rawPeriod } = await params;
  if (!RANKING_PERIODS.includes(rawPeriod as RankingPeriod)) {
    notFound();
  }
  const period = rawPeriod as RankingPeriod;
  const meta = RANKING_PERIOD_META[period];
  const canonicalPath = "/rankings/" + period;
  const canonicalUrl = SITE_ORIGIN + canonicalPath;
  const rankingJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: meta.label + " Roblox Game Rankings",
    description: meta.description + " Bobaks Ranking.",
    url: canonicalUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "Bobaks Ranking",
      url: SITE_ORIGIN,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_ORIGIN + "/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Rankings",
          item: SITE_ORIGIN + "/rankings/live",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: meta.label,
          item: canonicalUrl,
        },
      ],
    },
  };
  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" aria-hidden="true" />Home</Link>
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Bobaks Rankings</div>
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">{meta.label}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{meta.description}</p>
      </div>
      <nav aria-label="Ranking periods" className="flex gap-2 overflow-x-auto pb-1">
        {RANKING_PERIODS.map((item) => {
          const itemMeta = RANKING_PERIOD_META[item];
          const active = item === period;
          return <Link key={item} href={"/rankings/" + item} aria-current={active ? "page" : undefined} className={["inline-flex shrink-0 items-center gap-1 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors", active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"].join(" ")}>{itemMeta.label}{active ? <ChevronRight className="size-3.5" aria-hidden="true" /> : null}</Link>;
        })}
      </nav>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm">
        <div><span className="font-semibold">Top 100</span><span className="ml-2 text-muted-foreground">Live data loads after the page opens</span></div>
        <Link href="/methodology" className="font-semibold hover:underline">How rankings work</Link>
      </div>
      <RankingPeriodView period={period} scoreLabel={meta.scoreLabel} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(rankingJsonLd)
            .replace(/</g, "\\u003c")
            .replace(/>/g, "\\u003e")
            .replace(/&/g, "\\u0026"),
        }}
      />
    </div>
  );
}