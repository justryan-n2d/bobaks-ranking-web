"use client";

import { useState } from "react";
import { ArrowLeftRight, ArrowRight } from "lucide-react";

import type { SearchGame } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GameSelector } from "@/components/game-selector";

type ComparePickerProps = {
  initialA: SearchGame | null;
  initialB: SearchGame | null;
};

export function ComparePicker({ initialA, initialB }: ComparePickerProps) {
  const [gameA, setGameA] = useState<SearchGame | null>(initialA);
  const [gameB, setGameB] = useState<SearchGame | null>(initialB);

  const compare = () => {
    if (!gameA || !gameB) return;
    window.location.assign(
      "/compare?a=" + encodeURIComponent(String(gameA.id)) +
      "&b=" + encodeURIComponent(String(gameB.id)),
    );
  };

  const swap = () => {
    setGameA(gameB);
    setGameB(gameA);
  };

  return (
    <Card className="overflow-visible p-5 sm:p-6">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-end">
        <GameSelector
          label="Game A"
          value={gameA}
          excludeId={gameB ? String(gameB.id) : undefined}
          onChange={setGameA}
        />
        <button
          type="button"
          className="mx-auto hidden size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-accent md:inline-flex"
          onClick={swap}
          disabled={!gameA && !gameB}
          aria-label="Swap games"
          title="Swap games"
        >
          <ArrowLeftRight className="size-4" aria-hidden="true" />
        </button>
        <GameSelector
          label="Game B"
          value={gameB}
          excludeId={gameA ? String(gameA.id) : undefined}
          onChange={setGameB}
        />
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs leading-5 text-muted-foreground">
          Search by game name or creator. You do not need to know a Roblox game ID.
        </div>
        <Button onClick={compare} disabled={!gameA || !gameB} className="sm:min-w-32">
          Compare games
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </Card>
  );
}
