import Link from "next/link";
import {
  ArrowRight,
  Search,
  Sparkles,
} from "lucide-react";

import { HomeSocialFeed } from "@/components/home-social-feed";
import { LiveHomeBoard } from "@/components/live-home-board";

export function HomeDiscovery() {
  return (
    <div className="space-y-8">
      <section className="bobaks-hero rounded-[2rem] border p-5 shadow-sm sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-100 backdrop-blur-sm">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Live Roblox experience rankings
          </div>
          <h1 className="relative z-[1] text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            See what gamers are playing right now.
          </h1>
          <p className="relative z-[1] mt-4 max-w-2xl text-base leading-7 text-sky-100/85 sm:text-lg">
            Find rising games, follow player-count trends, and explore the numbers behind Roblox experiences.
          </p>
        </div>

        <form action="/search" className="bobaks-search-form mt-7">
          <label className="sr-only" htmlFor="home-search">Search games or creators</label>
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="home-search"
              name="q"
              maxLength={100}
              placeholder="Search a game or creator..."
              className="bobaks-search-input h-12 w-full rounded-2xl border pl-11 pr-4 text-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="bobaks-search-button h-12 rounded-2xl px-5 text-sm font-bold shadow-lg shadow-black/15 hover:brightness-105"
          >
            Search
          </button>
        </form>

        <div className="mt-7 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Link href="/rankings/live" className="rounded-full border border-white/15 bg-white/8 px-3 py-2 text-sky-100 transition-colors hover:bg-white/15">
            Live Top 100
          </Link>
          <Link href="/rankings/weekly" className="rounded-full border border-white/15 bg-white/8 px-3 py-2 text-sky-100 transition-colors hover:bg-white/15">
            This Week
          </Link>
          <Link href="/rankings/monthly" className="rounded-full border border-white/15 bg-white/8 px-3 py-2 text-sky-100 transition-colors hover:bg-white/15">
            This Month
          </Link>
          <Link href="/rankings/yearly" className="rounded-full border border-white/15 bg-white/8 px-3 py-2 text-sky-100 transition-colors hover:bg-white/15">
            This Year
          </Link>
        </div>
      </section>

      <LiveHomeBoard />
      <HomeSocialFeed />

      <section className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/compare"
          className="bobaks-signal-card group rounded-2xl border border-border p-5"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Compare</div>
          <h2 className="mt-2 text-lg font-black">Put two games side by side</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Compare players, rankings, peaks, and trends.</p>
          <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold group-hover:underline">
            Compare games <ArrowRight className="size-4" aria-hidden="true" />
          </div>
        </Link>

        <Link
          href="/saved"
          className="bobaks-signal-card group rounded-2xl border border-border p-5"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Watchlist</div>
          <h2 className="mt-2 text-lg font-black">Keep the games you care about</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Save games on this device without an account.</p>
          <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold group-hover:underline">
            Open watchlist <ArrowRight className="size-4" aria-hidden="true" />
          </div>
        </Link>

        <Link
          href="/methodology"
          className="bobaks-signal-card group rounded-2xl border border-border p-5"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Transparency</div>
          <h2 className="mt-2 text-lg font-black">See how Bobaks ranks games</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Understand freshness, eligibility, coverage, and ranking rules.
          </p>
          <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold group-hover:underline">
            View methodology <ArrowRight className="size-4" aria-hidden="true" />
          </div>
        </Link>
      </section>
    </div>
  );
}
