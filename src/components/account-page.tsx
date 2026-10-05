"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ExternalLink, Link2, LogIn, LogOut, ShieldCheck, UserRound } from "lucide-react";

import { useAuth } from "@/components/account-provider";
import { getGame, type GameProfile } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function AuthForm() {
  const { signIn, signUp, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setConfirmation(false);
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        const result = await signUp(email, password, displayName);
        if (result.needsConfirmation) setConfirmation(true);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  if (confirmation) {
    return (
      <Card className="mx-auto max-w-lg p-6 sm:p-8">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
          <Check className="size-5" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-xl font-black">Check your email</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Bobaks sent a confirmation link to <strong>{email}</strong>. Confirm it, then come back and log in.
        </p>
        <Button className="mt-5" variant="outline" onClick={() => { setConfirmation(false); setMode("signin"); }}>
          Back to log in
        </Button>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-lg p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-muted">
          {mode === "signin" ? <LogIn className="size-5" aria-hidden="true" /> : <UserRound className="size-5" aria-hidden="true" />}
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {mode === "signin" ? "Welcome back" : "New account"}
          </div>
          <h2 className="text-xl font-black">{mode === "signin" ? "Log in to Bobaks" : "Create your Bobaks account"}</h2>
        </div>
      </div>

      <div className="mt-5 flex rounded-xl bg-muted p-1">
        <button type="button" className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${mode === "signin" ? "bg-background shadow-sm" : "text-muted-foreground"}`} onClick={() => setMode("signin")}>Log in</button>
        <button type="button" className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${mode === "signup" ? "bg-background shadow-sm" : "text-muted-foreground"}`} onClick={() => setMode("signup")}>Create account</button>
      </div>

      <form className="mt-5 space-y-4" onSubmit={submit}>
        {mode === "signup" ? (
          <label className="block">
            <span className="text-sm font-semibold">Display name</span>
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={80} autoComplete="name" className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="How should Bobaks show you?" />
          </label>
        ) : null}
        <label className="block">
          <span className="text-sm font-semibold">Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required autoComplete="email" className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Password</span>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </label>
        {error ? <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</div> : null}
        <Button type="submit" className="w-full" disabled={loading || busy}>
          {busy ? "Working..." : mode === "signin" ? "Log in" : "Create account"}
        </Button>
      </form>

      <p className="mt-5 text-xs leading-5 text-muted-foreground">
        Accounts are optional. You can keep browsing as a guest.
      </p>
    </Card>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-border p-4 hover:bg-accent/40">
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span>
      </span>
      <input
        type="checkbox"
        className="mt-1 size-4 accent-foreground"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function SignedInAccount() {
  const {
    user,
    profile,
    alerts,
    identityPreferences,
    robloxIdentity,
    watchlistIds,
    savedComparisons,
    updateProfile,
    updateAlerts,
    updateIdentityPreferences,
    startRobloxConnection,
    disconnectRoblox,
    removeComparison,
    signOut,
  } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [isPublic, setIsPublic] = useState(Boolean(profile?.is_public));
  const [alertState, setAlertState] = useState({
    alerts_enabled: alerts?.alerts_enabled ?? true,
    top10_enabled: alerts?.top10_enabled ?? true,
    new_peak_enabled: alerts?.new_peak_enabled ?? true,
    rank_jump_enabled: alerts?.rank_jump_enabled ?? true,
    rank_jump_threshold: alerts?.rank_jump_threshold ?? 5,
  });
  const [identityState, setIdentityState] = useState({
    show_roblox_identity: identityPreferences?.show_roblox_identity ?? false,
    show_roblox_avatar: identityPreferences?.show_roblox_avatar ?? false,
  });
  const [watchlistGames, setWatchlistGames] = useState<GameProfile[]>([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => setDisplayName(profile?.display_name ?? ""), [profile?.display_name]);
  useEffect(() => setIsPublic(Boolean(profile?.is_public)), [profile?.is_public]);
  useEffect(() => {
    setAlertState({
      alerts_enabled: alerts?.alerts_enabled ?? true,
      top10_enabled: alerts?.top10_enabled ?? true,
      new_peak_enabled: alerts?.new_peak_enabled ?? true,
      rank_jump_enabled: alerts?.rank_jump_enabled ?? true,
      rank_jump_threshold: alerts?.rank_jump_threshold ?? 5,
    });
  }, [alerts]);
  useEffect(() => {
    setIdentityState({
      show_roblox_identity: identityPreferences?.show_roblox_identity ?? false,
      show_roblox_avatar: identityPreferences?.show_roblox_avatar ?? false,
    });
  }, [identityPreferences]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const results = await Promise.all(watchlistIds.map((id) => getGame(id).catch(() => null)));
      if (!cancelled) setWatchlistGames(results.filter((value): value is GameProfile => Boolean(value)));
    }
    void load();
    return () => { cancelled = true; };
  }, [watchlistIds]);

  async function saveProfile() {
    setBusy("profile");
    setError("");
    try {
      await updateProfile({ display_name: displayName, is_public: isPublic });
      setSaved("Profile saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your profile.");
    } finally {
      setBusy("");
    }
  }

  async function saveAlerts() {
    setBusy("alerts");
    setError("");
    try {
      await updateAlerts(alertState);
      setSaved("Alert settings saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save alert settings.");
    } finally {
      setBusy("");
    }
  }

  async function saveIdentitySettings(next: { show_roblox_identity: boolean; show_roblox_avatar: boolean }) {
    setBusy("identity");
    setError("");
    const normalized = next.show_roblox_identity ? next : { show_roblox_identity: false, show_roblox_avatar: false };
    setIdentityState(normalized);
    try {
      await updateIdentityPreferences(normalized);
      setSaved("Roblox visibility settings saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save Roblox visibility settings.");
    } finally {
      setBusy("");
    }
  }

  async function connectRoblox() {
    setBusy("roblox");
    setError("");
    try {
      const url = await startRobloxConnection();
      window.location.assign(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not start Roblox connection.");
      setBusy("");
    }
  }

  async function disconnect() {
    setBusy("roblox");
    setError("");
    try {
      await disconnectRoblox();
      setSaved("Roblox connection disconnected.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not disconnect Roblox.");
    } finally {
      setBusy("");
    }
  }



  return (
    <div className="space-y-6">
      <section>
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Account</div>
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Your Bobaks account</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Keep your saved games and settings with you across devices. Your Bobaks account stays separate from your Roblox identity.
        </p>
      </section>

      {error ? <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div> : null}
      {saved ? <div role="status" className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">{saved}</div> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <UserRound className="size-5" aria-hidden="true" />
            <div>
              <h2 className="font-black">Profile</h2>
              <p className="text-xs text-muted-foreground">Community identity foundation</p>
            </div>
          </div>
          <label className="mt-5 block">
            <span className="text-sm font-semibold">Display name</span>
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={80} className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </label>
          <div className="mt-3 rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm">
            <div className="font-medium">{user?.email}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {user?.email_confirmed_at || user?.confirmed_at ? "Email verified" : "Email confirmation pending"}
            </div>
          </div>
          <ToggleRow label="Public profile" description="Allow your Bobaks profile to be visible when community profile surfaces are introduced." checked={isPublic} onChange={setIsPublic} />
          <Button className="mt-4" onClick={saveProfile} disabled={busy === "profile"}>{busy === "profile" ? "Saving..." : "Save profile"}</Button>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5" aria-hidden="true" />
            <div>
              <h2 className="font-black">Alerts</h2>
              <p className="text-xs text-muted-foreground">Persistent account preferences</p>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <ToggleRow label="Enable alerts" description="Master switch for Bobaks account alerts." checked={alertState.alerts_enabled} onChange={(value) => setAlertState((current) => ({ ...current, alerts_enabled: value }))} />
            <ToggleRow label="Top 10 alerts" description="Alert when a saved game enters the live Top 10." checked={alertState.top10_enabled} onChange={(value) => setAlertState((current) => ({ ...current, top10_enabled: value }))} />
            <ToggleRow label="New peak alerts" description="Alert when Bobaks records a new peak for a saved game." checked={alertState.new_peak_enabled} onChange={(value) => setAlertState((current) => ({ ...current, new_peak_enabled: value }))} />
            <ToggleRow label="Rank jump alerts" description={`Alert when a saved game moves by at least ${alertState.rank_jump_threshold} ranks.`} checked={alertState.rank_jump_enabled} onChange={(value) => setAlertState((current) => ({ ...current, rank_jump_enabled: value }))} />
          </div>
          <label className="mt-3 block">
            <span className="text-xs font-semibold text-muted-foreground">Rank jump threshold</span>
            <input type="number" min={1} max={100} value={alertState.rank_jump_threshold} onChange={(event) => setAlertState((current) => ({ ...current, rank_jump_threshold: Number(event.target.value) }))} className="mt-1 h-10 w-28 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </label>
          <Button className="mt-4" onClick={saveAlerts} disabled={busy === "alerts"}>{busy === "alerts" ? "Saving..." : "Save alerts"}</Button>
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-black">Roblox identity</h2>
            <p className="mt-1 text-sm text-muted-foreground">Connect only when you choose. Bobaks stores the Roblox identity separately from your account.</p>
          </div>
          <Link2 className="size-5 shrink-0" aria-hidden="true" />
        </div>
        {robloxIdentity?.status === "connected" ? (
          <div className="mt-5 rounded-2xl border border-border p-4">
            <div className="flex items-center gap-3">
              {robloxIdentity.avatar_url ? <img src={robloxIdentity.avatar_url} alt="" width={48} height={48} className="size-12 rounded-full border border-border object-cover" /> : <div className="size-12 rounded-full bg-muted" />}
              <div className="min-w-0">
                <div className="font-semibold">{robloxIdentity.display_name || robloxIdentity.username || "Connected Roblox account"}</div>
                <div className="text-xs text-muted-foreground">@{robloxIdentity.username || "username unavailable"} · Roblox ID {String(robloxIdentity.roblox_user_id)}</div>
                <div className="mt-1 text-xs text-muted-foreground">Last verified {formatDate(robloxIdentity.last_verified_at)}</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <ToggleRow label="Show Roblox identity" description="Permission for future public Bobaks profile and community surfaces to show the connected Roblox identity." checked={identityState.show_roblox_identity} disabled={busy === "identity"} onChange={(value) => saveIdentitySettings({ show_roblox_identity: value, show_roblox_avatar: value && identityState.show_roblox_avatar })} />
              <ToggleRow label="Show Roblox avatar" description="Permission to show the Roblox avatar where your Roblox identity is already visible." checked={identityState.show_roblox_avatar} disabled={!identityState.show_roblox_identity || busy === "identity"} onChange={(value) => saveIdentitySettings({ show_roblox_identity: true, show_roblox_avatar: value })} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {robloxIdentity.profile_url ? <a href={robloxIdentity.profile_url} target="_blank" rel="noreferrer noopener" className="inline-flex h-9 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold hover:bg-accent">Open Roblox profile <ExternalLink className="size-3.5" aria-hidden="true" /></a> : null}
              <Button variant="outline" onClick={disconnect} disabled={busy === "roblox"}>{busy === "roblox" ? "Working..." : "Disconnect Roblox"}</Button>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-border p-5">
            <div className="text-sm font-semibold">No Roblox account connected</div>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              The connection uses authorization code + PKCE. Roblox username and display name are profile data, not the permanent identity key.
            </p>
            <Button className="mt-4" onClick={connectRoblox} disabled={busy === "roblox"}>{busy === "roblox" ? "Opening Roblox..." : "Connect Roblox"}</Button>
          </div>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-black">Watchlist</h2>
            <Link href="/saved" className="text-sm font-semibold hover:underline">Open saved</Link>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{watchlistIds.length} saved game{watchlistIds.length === 1 ? "" : "s"} synced to your account.</p>
          {watchlistGames.length ? (
            <div className="mt-4 space-y-2">
              {watchlistGames.slice(0, 6).map((game) => (
                <Link key={game.id} href={`/game/${encodeURIComponent(game.id)}`} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-accent/50">
                  {game.iconUrl ? <img src={game.iconUrl} alt="" width={40} height={40} className="size-10 rounded-xl object-cover" /> : <div className="size-10 rounded-xl bg-muted" />}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{game.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{game.creatorName}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-black">Saved comparisons</h2>
            <Link href="/compare" className="text-sm font-semibold hover:underline">Compare games</Link>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Keep useful game pairings on your account.</p>
          <div className="mt-4 space-y-2">
            {savedComparisons.length ? savedComparisons.slice(0, 6).map((comparison) => (
              <div key={comparison.id} className="flex items-center gap-2 rounded-xl border border-border p-3">
                <Link className="flex-1 text-sm font-semibold hover:underline" href={`/compare?a=${encodeURIComponent(String(comparison.game_id_a))}&b=${encodeURIComponent(String(comparison.game_id_b))}`}>
                  {String(comparison.game_id_a)} vs {String(comparison.game_id_b)}
                </Link>
                <button type="button" onClick={() => void removeComparison(comparison.id)} className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground">Remove</button>
              </div>
            )) : <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">No saved comparisons yet.</div>}
          </div>
        </Card>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        <div>
          <h2 className="font-black">Account security</h2>
          <p className="mt-1 text-sm text-muted-foreground">Log out to end this browser session. Your account data remains server-side.</p>
        </div>
        <Button variant="outline" onClick={() => void signOut()}><LogOut className="size-4" aria-hidden="true" /> Log out</Button>
      </Card>
    </div>
  );
}

export function AccountPage() {
  const { loading, user } = useAuth();

  if (loading) {
    return <Card className="p-8 text-sm text-muted-foreground">Loading your account...</Card>;
  }

  return user ? <SignedInAccount /> : (
    <div className="space-y-6">
      <section>
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Account</div>
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Accounts are optional</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Browse Bobaks as a guest, or create an account to sync saved games, alerts, comparisons, and future community identity settings across devices.
        </p>
      </section>
      <AuthForm />
    </div>
  );
}
