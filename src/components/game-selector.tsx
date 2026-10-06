"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, LoaderCircle, Search } from "lucide-react";

import type { RankingResponse, SearchGame } from "@/lib/api";
import { cn } from "@/lib/utils";

type GameSelectorProps = {
  label: string;
  value: SearchGame | null;
  excludeId?: string;
  onChange: (game: SearchGame) => void;
};

export function GameSelector({ label, value, excludeId, onChange }: GameSelectorProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [liveByGameId, setLiveByGameId] = useState(new Map<string, { rank: number; players: number }>());

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setError(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        const [searchResponse, liveResponse] = await Promise.all([
          fetch("/api/search?q=" + encodeURIComponent(query.trim()), {
            cache: "no-store",
            headers: { accept: "application/json" },
            signal: controller.signal,
          }),
          fetch("/api/rankings/live", {
            cache: "no-store",
            headers: { accept: "application/json" },
            signal: controller.signal,
          }).catch(() => null),
        ]);
        if (!searchResponse.ok) throw new Error("Search failed");
        const payload = (await searchResponse.json()) as { data?: SearchGame[] };
        if (liveResponse?.ok) {
          const livePayload = (await liveResponse.json()) as RankingResponse;
          setLiveByGameId(
            new Map(
              (Array.isArray(livePayload.data) ? livePayload.data : []).map((game) => [
                String(game.gameId),
                { rank: Number(game.rank), players: Math.max(0, Number(game.score) || 0) },
              ]),
            ),
          );
        }
        setResults(Array.isArray(payload.data) ? payload.data : []);
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setResults([]);
        setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, query]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filtered = results.filter((game) => String(game.id) !== excludeId).slice(0, 8);
  const chooseLabel = "Choose " + label;

  useEffect(() => {
    setActiveIndex(filtered.length ? 0 : -1);
  }, [query, filtered.length]);

  return (
    <div ref={rootRef} className="relative">
      <label className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </label>

      <button
        type="button"
        className="mt-1 flex min-h-16 w-full items-center gap-3 rounded-2xl border border-border bg-background px-3 text-left outline-none transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => {
          setOpen((current) => !current);
          setQuery("");
        }}
      >
        {value?.iconUrl ? (
          <img src={value.iconUrl} alt="" width={44} height={44} className="size-11 shrink-0 rounded-xl border border-border object-cover" />
        ) : (
          <div className="size-11 shrink-0 rounded-xl bg-muted" aria-hidden="true" />
        )}
        <div className="min-w-0 flex-1">
          {value ? (
            <>
              <div className="truncate text-sm font-semibold">{value.name || "Unknown experience"}</div>
              <div className="truncate text-xs text-muted-foreground">{value.creatorName || "Unknown creator"}</div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">Search for a game...</div>
          )}
        </div>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label={chooseLabel}
          className="absolute inset-x-0 z-50 mt-2 overflow-hidden rounded-2xl border-2 border-border bg-[var(--card)] shadow-2xl ring-1 ring-black/20"
        >
          <div className="bg-[var(--surface-2)] p-2">
            <label className="relative block">
              <span className="sr-only">Search games</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setOpen(false);
                    return;
                  }
                  if (!filtered.length) return;
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActiveIndex((index) => Math.min(filtered.length - 1, index + 1));
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActiveIndex((index) => Math.max(0, index - 1));
                  } else if (event.key === "Enter" && activeIndex >= 0) {
                    event.preventDefault();
                    onChange(filtered[activeIndex]);
                    setOpen(false);
                    setQuery("");
                  }
                }}
                placeholder="Game name or creator..."
                role="combobox"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={
                  activeIndex >= 0 && filtered[activeIndex]
                    ? listboxId + "-" + String(filtered[activeIndex].id)
                    : undefined
                }
                className="h-11 w-full rounded-xl border border-border bg-[var(--card)] px-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground outline-none shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          </div>

          <div className="max-h-72 overflow-y-auto bg-[var(--card)] p-1.5">
            {query.trim().length < 2 ? (
              <div className="bg-[var(--card)] p-4 text-center text-sm text-muted-foreground">Type at least 2 characters to search.</div>
            ) : loading ? (
              <div className="flex items-center justify-center gap-2 bg-[var(--card)] p-5 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                Searching Bobaks...
              </div>
            ) : error ? (
              <div className="bg-[var(--card)] p-4 text-center text-sm text-muted-foreground">Search is temporarily unavailable.</div>
            ) : filtered.length ? (
              filtered.map((game) => {
                const selected = value && String(value.id) === String(game.id);
                return (
                  <button
                    id={listboxId + "-" + String(game.id)}
                    type="button"
                    role="option"
                    aria-selected={Boolean(selected)}
                    key={String(game.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl bg-[var(--card)] px-2.5 py-2.5 text-left hover:bg-[var(--accent)] focus-visible:bg-[var(--accent)] focus-visible:outline-none",
                      activeIndex === filtered.indexOf(game) && "bg-accent",
                    )}
                    onClick={() => {
                      onChange(game);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    {game.iconUrl ? (
                      <img src={game.iconUrl} alt="" width={42} height={42} className="size-10 shrink-0 rounded-xl border border-border object-cover" />
                    ) : (
                      <div className="size-10 shrink-0 rounded-xl bg-muted" aria-hidden="true" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{game.name || "Unknown experience"}</div>
                      <div className="truncate text-xs text-muted-foreground">{game.creatorName || "Unknown creator"}</div>
                      {liveByGameId.has(String(game.id)) ? (
                        <div className="mt-0.5 text-[11px] font-semibold text-muted-foreground">
                          {new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(liveByGameId.get(String(game.id))!.players)} players · Live #{liveByGameId.get(String(game.id))!.rank}
                        </div>
                      ) : (
                        <div className="mt-0.5 text-[11px] text-muted-foreground">Live ranking unavailable</div>
                      )}
                    </div>
                    {selected ? <Check className="size-4 text-primary" aria-hidden="true" /> : null}
                  </button>
                );
              })
            ) : (
              <div className="bg-[var(--card)] p-4 text-center text-sm text-muted-foreground">No active games matched that search.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
