"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
import { useAuth } from "@/components/account-provider";
import { BobaksBrand } from "@/components/bobaks-brand";
import { SiteFooter } from "@/components/site-footer";

const ICONS = {
  home: Home,
  rankings: BarChart3,
  search: Search,
  saved: Bookmark,
  compare: GitCompare,
  community: Users,
  info: Info,
} as const;

function LinkPendingIndicator() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden="true"
      className={cn("bobaks-nav-pending", pending && "is-pending")}
    />
  );
}

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
          ? "bobaks-nav-active"
          : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
      <span>{item.label}</span>
      <LinkPendingIndicator />
    </Link>
  );
}

function SidebarContent({ close }: { close: () => void }) {
  const { user, profile, loading } = useAuth();
  const main = NAV_ITEMS.filter((item) => item.section === "main");
  const info = NAV_ITEMS.filter((item) => item.section === "info");

  return (
    <>
      <div className="flex items-center justify-between px-2 pb-5 pt-2">
        <BobaksBrand close={close} />
        <button
          ref={drawerCloseRef}
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-xl hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
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
            <div className="truncate text-sm font-semibold">
              {loading ? "Account" : user ? (profile?.display_name || user.email || "Your account") : "Guest"}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {loading ? "Loading..." : user ? "Signed in · save across devices" : "Sign in to save across devices"}
            </div>
          </div>
          <LinkPendingIndicator />
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

export function SiteShell({
  children,
  demoMode,
}: {
  children: React.ReactNode;
  demoMode: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerCloseRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      menuButtonRef.current?.focus();
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    drawerCloseRef.current?.focus();

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const openSidebar = () => {
    menuButtonRef.current = document.activeElement as HTMLButtonElement | null;
    setOpen(true);
  };

  const close = () => setOpen(false);

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-background text-foreground">
      <a
        href="#main-content"
        className="fixed left-3 top-3 z-[200] -translate-y-24 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-xl transition-transform focus:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Skip to content
      </a>
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-border bg-background/95 px-4 backdrop-blur md:hidden">
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-xl hover:bg-accent"
          onClick={openSidebar}
          aria-label="Open navigation"
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
        <BobaksBrand compact close={() => undefined} />
      </div>

      {open ? (
        <div className="fixed inset-0 z-[100] md:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="bobaks-menu-overlay absolute inset-y-0 right-0 left-[min(18rem,85vw)] bg-black/65"
            onClick={close}
          />

          <aside
            id="mobile-navigation"
            role="dialog"
            aria-label="Mobile navigation"
            aria-modal="true"
            className="absolute inset-y-0 left-0 z-10 flex w-72 max-w-[85vw] flex-col border-r border-white/20 bg-card/75 p-4 shadow-2xl backdrop-blur-2xl saturate-150 bobaks-drawer-enter"
          >
            <SidebarContent close={close} />
          </aside>
        </div>
      ) : null}

      <aside className="bobaks-sidebar fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-border bg-card p-4 shadow-xl md:flex">
        <SidebarContent close={close} />
      </aside>

      <main id="main-content" tabIndex={-1} className="flex min-h-screen min-w-0 flex-1 flex-col outline-none md:pl-64">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-8 pt-20 sm:px-6 md:px-8 md:pt-10">
          <div className="flex-1">
            {demoMode ? (
              <div
                role="status"
                className="mb-6 rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm dark:border-amber-400/40 dark:bg-amber-950/30 dark:text-amber-100"
              >
                <strong>Preview demo mode:</strong> this branch is using isolated sample data for QA. Production data is not being modified.
              </div>
            ) : null}
            {children}
          </div>

          <SiteFooter />
        </div>
      </main>
    </div>
  );
}
