"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  AUTH_SESSION_STORAGE_KEY,
  createAuthClient,
  type AlertPreferences,
  type AuthClient,
  type AuthSession,
  type AuthUser,
  type IdentityPreferences,
  type Profile,
  type RobloxIdentity,
  type SavedComparison,
} from "@/lib/auth-client";
import {
  WATCHLIST_STORAGE_KEY,
  parseWatchlist,
  type WatchlistGame,
} from "@/lib/watchlist";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://zhrfozouzvxhpkylmpwh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_m5sYdsVZpWMOVRxyMSwblw_dIesP93F";

type AuthContextValue = {
  client: AuthClient;
  loading: boolean;
  session: AuthSession | null;
  user: AuthUser | null;
  profile: Profile | null;
  alerts: AlertPreferences | null;
  identityPreferences: IdentityPreferences | null;
  robloxIdentity: RobloxIdentity | null;
  watchlistIds: string[];
  savedComparisons: SavedComparison[];
  refreshAccount: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<Profile, "display_name" | "avatar_url" | "is_public">>) => Promise<void>;
  updateAlerts: (patch: Partial<AlertPreferences>) => Promise<void>;
  updateIdentityPreferences: (patch: Partial<Pick<IdentityPreferences, "show_roblox_identity" | "show_roblox_avatar">>) => Promise<void>;
  toggleWatchlist: (game: Omit<WatchlistGame, "savedAt">) => Promise<void>;
  isWatchlisted: (id: string) => boolean;
  removeWatchlist: (id: string) => Promise<void>;
  removeComparison: (id: string) => Promise<void>;
  startRobloxConnection: () => Promise<string>;
  disconnectRoblox: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function localGuestIds(): string[] {
  try {
    return parseWatchlist(window.localStorage.getItem(WATCHLIST_STORAGE_KEY)).map((item) => item.id);
  } catch {
    return [];
  }
}

function mergeIds(values: string[]) {
  return [...new Set(values.map(String).filter((id) => /^\d{1,20}$/.test(id)))].slice(0, 25);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(
    () => createAuthClient({ supabaseUrl: SUPABASE_URL, publishableKey: SUPABASE_PUBLISHABLE_KEY }),
    [],
  );
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [alerts, setAlerts] = useState<AlertPreferences | null>(null);
  const [identityPreferences, setIdentityPreferences] = useState<IdentityPreferences | null>(null);
  const [robloxIdentity, setRobloxIdentity] = useState<RobloxIdentity | null>(null);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>([]);

  async function loadAccount(nextSession: AuthSession | null, migrateGuest = false) {
    if (!nextSession) {
      setSession(null);
      setUser(null);
      setProfile(null);
      setAlerts(null);
      setIdentityPreferences(null);
      setRobloxIdentity(null);
      setWatchlistIds(localGuestIds());
      setSavedComparisons([]);
      return;
    }

    setSession(nextSession);
    const currentUser = await client.getUser();
    setUser(currentUser);

    if (migrateGuest) {
      const guestIds = localGuestIds();
      for (const id of guestIds) {
        try {
          await client.addWatchlistGame(id);
        } catch {
          // Keep the guest copy for a retry-safe migration.
        }
      }
    }

    const [nextProfile, nextAlerts, nextIdentityPrefs, nextRobloxIdentity, remoteWatchlist, comparisons] =
      await Promise.all([
        client.getProfile().catch(() => null),
        client.getAlerts().catch(() => null),
        client.getIdentityPreferences().catch(() => null),
        client.getRobloxIdentity().catch(() => null),
        client.listWatchlist().catch(() => []),
        client.listSavedComparisons().catch(() => []),
      ]);

    setProfile(nextProfile);
    setAlerts(nextAlerts);
    setIdentityPreferences(nextIdentityPrefs);
    setRobloxIdentity(nextRobloxIdentity);
    setWatchlistIds(mergeIds((remoteWatchlist ?? []).map((row) => String(row.game_id))));
    setSavedComparisons(comparisons ?? []);
  }

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const recovered = await client.recoverSessionFromUrl();
        const next = recovered ?? await client.getSession();
        if (!active) return;
        await loadAccount(next, Boolean(next));
      } finally {
        if (active) setLoading(false);
      }
    })();

    const unsubscribe = client.onAuthStateChange((event, next) => {
      if (!active) return;
      setSession(next);
      if (event === "SIGNED_OUT") {
        void loadAccount(null);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "SIGNED_UP") {
        void loadAccount(next, event !== "TOKEN_REFRESHED").finally(() => setLoading(false));
      }
    });

    const onStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_SESSION_STORAGE_KEY) void client.getSession().then((next) => loadAccount(next, false));
    };
    window.addEventListener("storage", onStorage);
    return () => {
      active = false;
      unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, [client]);

  async function refreshAccount() {
    const next = await client.getSession();
    await loadAccount(next, false);
  }

  async function signIn(email: string, password: string) {
    await client.signIn({ email, password });
    await refreshAccount();
  }

  async function signUp(email: string, password: string, displayName: string) {
    const result = await client.signUp({ email, password, displayName });
    if (result.session) await refreshAccount();
    return { needsConfirmation: !result.session };
  }

  async function signOut() {
    await client.signOut();
    await loadAccount(null);
  }

  async function updateProfile(patch: Partial<Pick<Profile, "display_name" | "avatar_url" | "is_public">>) {
    setProfile(await client.updateProfile(patch));
  }

  async function updateAlerts(patch: Partial<AlertPreferences>) {
    setAlerts(await client.updateAlerts(patch));
  }

  async function updateIdentityPreferences(
    patch: Partial<Pick<IdentityPreferences, "show_roblox_identity" | "show_roblox_avatar">>,
  ) {
    setIdentityPreferences(await client.updateIdentityPreferences(patch));
  }

  async function toggleWatchlist(game: Omit<WatchlistGame, "savedAt">) {
    if (watchlistIds.includes(game.id)) {
      await client.removeWatchlistGame(game.id);
      setWatchlistIds((current) => current.filter((id) => id !== game.id));
    } else {
      await client.addWatchlistGame(game.id);
      setWatchlistIds((current) => mergeIds([game.id, ...current]));
    }
    window.dispatchEvent(new Event("bobaks-watchlist-change"));
  }

  async function removeWatchlist(id: string) {
    await client.removeWatchlistGame(id);
    setWatchlistIds((current) => current.filter((value) => value !== id));
    window.dispatchEvent(new Event("bobaks-watchlist-change"));
  }

  async function removeComparison(id: string) {
    await client.removeSavedComparison(id);
    setSavedComparisons((current) => current.filter((item) => item.id !== id));
  }

  function isWatchlisted(id: string) {
    return watchlistIds.includes(id);
  }

  async function startRobloxConnection() {
    return client.startRobloxConnection();
  }

  async function disconnectRoblox() {
    await client.disconnectRoblox();
    setRobloxIdentity((current) => current ? { ...current, status: "revoked" } : null);
    setIdentityPreferences((current) => current ? { ...current, show_roblox_identity: false, show_roblox_avatar: false } : null);
  }

  const value: AuthContextValue = {
    client,
    loading,
    session,
    user,
    profile,
    alerts,
    identityPreferences,
    robloxIdentity,
    watchlistIds,
    savedComparisons,
    refreshAccount,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateAlerts,
    updateIdentityPreferences,
    toggleWatchlist,
    isWatchlisted,
    removeWatchlist,
    removeComparison,
    startRobloxConnection,
    disconnectRoblox,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
