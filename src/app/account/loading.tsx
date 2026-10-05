import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-lg py-12" role="status" aria-live="polite">
      <span className="sr-only">Loading your account...</span>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Loading your account...
        </div>
      </div>
    </div>
  );
}
