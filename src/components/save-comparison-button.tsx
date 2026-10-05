"use client";

import { Check, Bookmark } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/components/account-provider";
import { Button } from "@/components/ui/button";

export function SaveComparisonButton({ gameIdA, gameIdB }: { gameIdA: string; gameIdB: string }) {
  const { user, client } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!user) {
    return <Link href="/account" className="inline-flex h-9 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold hover:bg-accent"><Bookmark className="size-4" aria-hidden="true" /> Sign in to save</Link>;
  }

  async function save() {
    if (busy || saved) return;
    setBusy(true);
    try {
      await client.saveComparison(gameIdA, gameIdB);
      setSaved(true);
    } finally {
      setBusy(false);
    }
  }

  return <Button variant="outline" size="sm" onClick={() => void save()} disabled={busy || saved}>
    {saved ? <Check className="size-4" aria-hidden="true" /> : <Bookmark className="size-4" aria-hidden="true" />}
    {saved ? "Saved" : busy ? "Saving..." : "Save comparison"}
  </Button>;
}
