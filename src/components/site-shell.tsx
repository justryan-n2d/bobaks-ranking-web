"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Bookmark,
  GitCompare,
  Home,
  Info,
  Menu,
  Search,
  Users,
  X,
  UserCircle2,
} from "lucide-react";

import { NAV_ITEMS, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const ICONS = {
  home: Home,
  rankings: BarChart3,
  search: Search,
  saved: Bookmark,
  compare: GitCompare,
  community: Users,
  info: Info,
} as const;

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const pathname = usePathname();
  const active =
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = ICONS[item.icon];

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );
}

function SidebarContent({ close }: { close: () => void }) {
  const main = NAV_ITEMS.filter((item) => item.section === "main");
  const info = NAV_ITEMS.filter((item) => item.section === "info");

  return (
    <>
      <div className="flex items-center justify-between px-2 pb-5 pt-2">
        <Link href="/" onClick={close}>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Bobaks</div>
          <div className="text-xl font-black tracking-tight">Ranking</div>
        </Link>
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-xl hover:bg-accent md:hidden"
          onClick={close}
          aria-label="Close navigation"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <Link
        href="/account"
        onClick={close}
        className="mb-6 rounded-2xl border border-border bg-background p-3 hover:bg-accent"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent">
            <UserCircle2 className="size-5 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold">Account</div>
            <div className="truncate text-xs text-muted-foreground">
              Optional. Sign in to save across devices.
            </div>
          </div>
        </div>
      </Link>

      <nav aria-label="Primary navigation" className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {main.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={close} />
        ))}
        <div className="mt-5 px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Information
        </div>
        {info.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={close} />
        ))}
      </nav>

      <div className="border-t border-border px-2 pt-4 text-xs leading-5 text-muted-foreground">
        <div>Independent fan-made analytics site.</div>
        <div>Not affiliated with Roblox Corporation.</div>
      </div>
    </>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-border bg-background/95 px-4 backdrop-blur md:hidden">
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-xl hover:bg-accent"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
        <Link href="/" className="ml-2 text-sm font-bold tracking-tight">
          Bobaks Ranking
        </Link>
      </div>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm md:hidden"
            onClick={close}
          />

          <aside
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="fixed inset-y-0 left-0 z-[61] flex w-72 max-w-[85vw] flex-col border-r border-border bg-card/75 p-4 shadow-2xl backdrop-blur-2xl md:hidden"
          >
            <SidebarContent close={close} />
          </aside>
        </>
      ) : null}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-border bg-card p-4 shadow-xl md:flex">
        <SidebarContent close={close} />
      </aside>

      <main className="min-h-screen md:pl-64">
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-20 sm:px-6 md:px-8 md:pt-10">
          {children}
        </div>
      </main>
    </div>
  );
}
