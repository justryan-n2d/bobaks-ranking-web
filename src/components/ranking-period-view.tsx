"use client";

import { useCallback, useEffect, useState } from "react";
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

export function RankingPeriodView({ period, scoreLabel }: { period: RankingPeriod; scoreLabel: string }) {
  const [response, setResponse] = useState<RankingResponse | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
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
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <LoadingSkeleton />;

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

  return <RankingTable games={response.data.slice(0, 100)} scoreLabel={scoreLabel} />;
}