import Link from "next/link";

export function BobaksBrand({ close, compact = false }: { close?: () => void; compact?: boolean }) {
  return (
    <Link
      href="/"
      onClick={close}
      aria-label="Bobaks Ranking home"
      className="inline-flex items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <img
        src="/brand/bobaks-mark.svg"
        alt=""
        width={36}
        height={36}
        className="size-9 shrink-0"
      />
      <span className={compact ? "text-sm font-bold tracking-tight" : "leading-none"}>
        <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Bobaks</span>
        <span className="mt-1 block text-lg font-black tracking-tight">Ranking</span>
      </span>
    </Link>
  );
}
