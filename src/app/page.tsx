import Link from "next/link";
import { ArrowRight, Search, TrendingUp } from "lucide-react";
import { LivePreview } from "@/components/live-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
        <div>
          <div className="mb-4 inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Live rankings and historical trends
          </div>
          <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            See what is happening across Roblox experiences.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Discover what is hot, see what is changing, and explore the games behind the numbers.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/rankings/live"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-semibold text-background hover:opacity-90"
            >
              View live rankings
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/search"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold hover:bg-accent"
            >
              <Search className="size-4" aria-hidden="true" />
              Search games
            </Link>
          </div>
        </div>
        <Card className="bg-background/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5" aria-hidden="true" />
              Built for gamers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>Track rank movement instead of looking at one player-count snapshot.</p>
            <p>Use historical data to understand whether a game is growing or falling.</p>
            <p>See how Bobaks calculates rankings with transparent methodology.</p>
          </CardContent>
        </Card>
      </section>

      <LivePreview />
    </div>
  );
}
