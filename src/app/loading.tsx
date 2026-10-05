import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl py-8" role="status" aria-live="polite">
      <span className="sr-only">Loading Bobaks...</span>
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-10 w-full max-w-xl animate-pulse rounded bg-muted sm:h-12" />
        <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-muted" />
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Loading Bobaks...
        </div>
      </div>
    </div>
  );
}
