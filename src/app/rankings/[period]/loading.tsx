import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="space-y-6" aria-label="Loading rankings" role="status">
      <span className="sr-only">Loading rankings...</span>
      <div>
        <div className="mb-3 h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="h-9 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-muted" />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" aria-hidden="true" />Loading live rankings...</div>
    </div>
  );
}