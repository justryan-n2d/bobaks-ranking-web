import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="space-y-6" aria-label="Loading game profile" role="status">
      <span className="sr-only">Loading game profile...</span>

      <div className="h-5 w-20 animate-pulse rounded bg-muted" />

      <header className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="size-24 shrink-0 animate-pulse rounded-3xl bg-muted" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-9 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="flex gap-2 pt-2">
              <div className="h-10 w-32 animate-pulse rounded-xl bg-muted" />
              <div className="h-10 w-24 animate-pulse rounded-xl bg-muted" />
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border bg-card p-5">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-7 w-28 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        Loading game data...
      </div>

      <div className="h-72 animate-pulse rounded-2xl border border-border bg-card" />
      <div className="h-56 animate-pulse rounded-2xl border border-border bg-card" />
      <div className="h-40 animate-pulse rounded-2xl border border-border bg-card" />
    </div>
  );
}
