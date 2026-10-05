"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUp, Flame, Trophy } from "lucide-react";

import type { SocialFeed } from "@/lib/api";
import { Card } from "@/components/ui/card";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.max(0, value));
}

function formatUpdated(value: string | null | undefined) {
  if (!value) return "Freshness unavailable";
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "Freshness unavailable";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp));
}

function SocialItem({
  item,
  kind,
}: {
  item: SocialFeed["trending"]["items"][number];
  kind: "trending" | "peak";
}) {
  const href = `/game/${encodeURIComponent(item.gameId)}`;

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-transparent p-3 transition-colors hover:border-border hover:bg-accent/60"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        {kind === "trending" ? (
          <ArrowUp className="size-4" aria-hidden="true" />
        ) : (
          <Trophy className="size-4" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold group-hover:underline">{item.name}</div>
        <div className="truncate text-xs text-muted-foreground">{item.creator || "Unknown creator"}</div>
      </div>
      <div className="text-right">
        {kind === "trending" ? (
          <>
            <div className="font-black text-emerald-600">+{item.rankChange || 0}</div>
            <div className="text-[11px] text-muted-foreground">ranks</div>
          </>
        ) : (
          <>
            <div className="font-black tabular-nums">{formatNumber(item.peakPlayers || 0)}</div>
            <div className="text-[11px] text-muted-foreground">peak</div>
          </>
        )}
      </div>
    </Link>
  );
}

export function HomeSocialFeed() {
  const [feed, setFeed] = useState<SocialFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/social/feed?period=live", {
      cache: "no-store",
      headers: { accept: "application/json" },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("social feed request failed");
        return (await response.json()) as SocialFeed;
      })
      .then((payload) => {
        if (!Array.isArray(payload.trending?.items) || !Array.isArray(payload.peaks?.items)) {
          throw new Error("invalid social feed payload");
        }
        setFeed(payload);
        setError(false);
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const trending = useMemo(() => feed?.trending.items.slice(0, 5) ?? [], [feed]);
  const peaks = useMemo(() => feed?.peaks.items.slice(0, 5) ?? [], [feed]);

  return (
    <>
      <section className="grid gap-5 lg:grid-cols-2">
        <Card className="bobaks-signal-card overflow-hidden">
          <div className="border-b border-border p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Flame className="size-3.5" aria-hidden="true" />
              Trending
            </div>
            <h2 className="mt-1 text-xl font-black">Biggest positive movers</h2>
            <p className="mt-1 text-sm text-muted-foreground">Games moving up the live ranking.</p>
          </div>
          <div className="divide-y divide-border p-2">
            {loading ? (
              <div className="p-5 text-sm text-muted-foreground">Loading live movers...</div>
            ) : trending.length ? (
              trending.map((item) => <SocialItem key={item.gameId} item={item} kind="trending" />)
            ) : (
              <div className="p-5 text-sm text-muted-foreground">
                {error ? "Live mover data is temporarily unavailable." : "No positive movers are available yet."}
              </div>
            )}
          </div>
        </Card>

        <Card className="bobaks-signal-card overflow-hidden">
          <div className="border-b border-border p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Trophy className="size-3.5" aria-hidden="true" />
              Peak records
            </div>
            <h2 className="mt-1 text-xl font-black">Highest recorded peaks</h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              Bobaks-recorded player peaks
              <span
                title="A Recorded Peak reflects the period Bobaks has been recording the game."
                aria-label="Recorded Peak information"
                className="inline-flex cursor-help"
              >
                ⓘ
              </span>
            </p>
          </div>
          <div className="divide-y divide-border p-2">
            {loading ? (
              <div className="p-5 text-sm text-muted-foreground">Loading peak records...</div>
            ) : peaks.length ? (
              peaks.map((item) => <SocialItem key={item.gameId} item={item} kind="peak" />)
            ) : (
              <div className="p-5 text-sm text-muted-foreground">
                {error ? "Peak data is temporarily unavailable." : "No peak records are available yet."}
              </div>
            )}
          </div>
        </Card>
      </section>

      <div className="text-xs text-muted-foreground">
        {feed ? `Discovery data refreshed ${formatUpdated(feed.generatedAt)}` : "Discovery data is loading."}
      </div>
    </>
  );
}
