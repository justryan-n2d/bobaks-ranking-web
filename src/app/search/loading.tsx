import { LoaderCircle } from "lucide-react";

function SearchResultSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="size-14 shrink-0 animate-pulse rounded-2xl bg-muted" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
      </div>
      <div className="hidden h-9 w-20 animate-pulse rounded-xl bg-muted sm:block" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6" aria-label="Loading search" role="status">
      <span className="sr-only">Loading search...</span>
      <div>
        <div className="mb-3 h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-9 w-72 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-muted" />
      </div>

      <div className="flex gap-2">
        <div className="h-11 flex-1 animate-pulse rounded-xl bg-muted" />
        <div className="h-11 w-24 animate-pulse rounded-xl bg-muted" />
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        Loading search results...
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <SearchResultSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
