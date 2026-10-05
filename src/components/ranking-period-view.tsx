"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

import { RankingTable } from "@/components/ranking-table";
import type { RankingPeriod, RankingResponse } from "@/lib/api";

function LoadingSkeleton() {
  return (
    <div className="space-y-2" aria-label="Loading rankings" role="status">
      <span className="sr-only">Loading rankings...</span>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 sm:px-5">
          <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="size-12 shrink-0 animate-pulse rounded-2xl bg-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          </div>
          <div className="hidden h-4 w-20 animate-pulse rounded bg-muted sm:block" />
          <div className="h-5 w-12 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}

function formatAge(value: string | null | undefined, now: number) {
  if (!value) return "Freshness unavailable";
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return "Freshness unavailable";
  const seconds = Math.max(0, Math.floor((now - parsed) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return seconds + "s ago";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + "m ago";
  return Math.floor(minutes / 60) + "h ago";
}

export function RankingPeriodView({ period, scoreLabel }: { period: RankingPeriod; scoreLabel: string }) {
  const [response, setResponse] = useState<RankingResponse | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [nextRefreshAt, setNextRefreshAt] = useState<number | null>(null);
  const inFlight = useRef(false);
  const nextRefreshRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading((current) => response === null ? true : current);
    setError(false);
    try {
      const result = await fetch("/api/rankings/" + encodeURIComponent(period), {
        cache: "no-store",
        headers: { accept: "application/json" },
      });
      if (!result.ok) throw new Error("ranking request failed");
      const payload = (await result.json()) as RankingResponse;
      if (!Array.isArray(payload.data)) throw new Error("invalid ranking payload");
      setResponse(payload);

      if (period === "live") {
        const intervalMs = Math.max(5_000, Number(payload.refreshIntervalSeconds ?? 30) * 1_000);
        const parsedNext = payload.nextRefreshAt ? Date.parse(payload.nextRefreshAt) : Number.NaN;
        const next = Number.isFinite(parsedNext) ? parsedNext : Date.now() + intervalMs;
        nextRefreshRef.current = next;
        setNextRefreshAt(next);
      }
    } catch {
      setError(true);
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [period, response]);

  useEffect(() => {
    void load();

    if (period !== "live") return;

    const clock = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (
        document.visibilityState === "visible" &&
        !inFlight.current &&
        nextRefreshRef.current !== null &&
        current >= nextRefreshRef.current
      ) {
        void load();
      }
    }, 1_000);

    const visibility = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", visibility);

    return () => {
      window.clearInterval(clock);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [load, period]);

  if (loading && !response) return <LoadingSkeleton />;

  if (error || !response) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-5 py-8 text-center">
        <div className="text-sm font-semibold">Rankings could not be loaded.</div>
        <p className="mt-1 text-sm text-muted-foreground">The live data service may be temporarily busy.</p>
        <button type="button" onClick={() => void load()} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent">
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {response.updatedAt || period === "live" ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold text-foreground">
              {period === "live" ? "Live ranking" : response.period ? String(response.period) : scoreLabel}
            </span>
            {response.updatedAt ? <span>Updated {formatAge(response.updatedAt, now)}</span> : null}
            {period === "live" && nextRefreshAt !== null ? (
              <span>Next refresh in {Math.max(0, Math.ceil((nextRefreshAt - now) / 1000))}s</span>
            ) : null}
            {error ? <span className="font-semibold text-[color:var(--signal-drop)]">Refresh failed, showing last good data</span> : null}
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className={cn("inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 font-semibold text-foreground hover:bg-accent disabled:opacity-60")}
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} aria-hidden="true" />
            Refresh
          </button>
        </div>
      ) : null}
      <RankingTable games={response.data.slice(0, 100)} scoreLabel={scoreLabel} />
    </div>
  );
}