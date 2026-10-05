import { LoaderCircle } from "lucide-react";

function RankingRowsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 sm:px-5"
        >
          <div className="size-8 shrink-0 animate-pulse rounded-xl bg-muted" />
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

export default function Loading() {
  return (
    <div className="space-y-6" aria-label="Loading rankings" role="status">
      <span className="sr-only">Loading rankings...</span>

      <div>
        <div className="mb-3 h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="h-9 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-muted" />
      </div>

      <div className="flex gap-2 overflow-hidden pb-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-10 w-24 shrink-0 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3">
        <div className="h-4 w-44 animate-pulse rounded bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        Loading live rankings...
      </div>

      <RankingRowsSkeleton />
    </div>
  );
}
