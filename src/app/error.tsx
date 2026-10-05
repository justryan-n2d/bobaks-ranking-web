"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-2xl py-16 sm:py-24" role="alert">
      <div className="rounded-3xl border border-destructive/25 bg-card p-6 shadow-sm sm:p-8">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" aria-hidden="true" />
        </div>
        <div className="mt-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Something went wrong</div>
          <h1 className="mt-1 text-2xl font-black tracking-tight">Bobaks could not finish loading this page.</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The problem may be temporary. Try again without losing your place.
          </p>
        </div>
        <Button className="mt-6" onClick={() => reset()}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    </div>
  );
}
