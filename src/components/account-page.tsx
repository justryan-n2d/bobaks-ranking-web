"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Check, Eye, EyeOff, ExternalLink, FileText, Link2, LogIn, LogOut, ShieldCheck, UserRound } from "lucide-react";

import { useAuth } from "@/components/account-provider";
import { getGame, type GameProfile } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LEGAL_VERSIONS } from "@/lib/legal";
import { cn } from "@/lib/utils";

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
  const { signIn, signInWithGoogle, signUp, loading, client } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; legal?: string }>({});
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const legalRef = useRef<HTMLInputElement | null>(null);

  function clearFieldError(field: "email" | "password" | "legal") {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function changeMode(nextMode: "signin" | "signup") {
    setMode(nextMode);
    setError("");
    setFieldErrors({});
    setShowPassword(false);
    setResendMessage("");
  }

  function validateForm() {
    const nextErrors: { email?: string; password?: string; legal?: string } = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (isSignUp && password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (isSignUp && !legalAccepted) {
      nextErrors.legal = "Please accept the Terms and Privacy Policy.";
    }

    setFieldErrors(nextErrors);

    if (nextErrors.email) {
      emailRef.current?.focus();
    } else if (nextErrors.password) {
      passwordRef.current?.focus();
    } else if (nextErrors.legal) {
      legalRef.current?.focus();
    }

    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || googleBusy) return;
    if (!validateForm()) return;

    setBusy(true);
    setError("");
    setConfirmation(false);

    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
      } else {
        const result = await signUp(email.trim(), password, displayName, true);
        if (result.needsConfirmation) setConfirmation(true);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  async function continueWithGoogle() {
    if (busy || googleBusy) return;
    if (mode === "signup" && !legalAccepted) {
      setError("Please agree to the Terms and Conditions and Privacy Policy to create your account.");
      return;
    }

    setGoogleBusy(true);
    setError("");

    try {
      await signInWithGoogle();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Google sign-in could not be started.");
      setGoogleBusy(false);
    }
  }

  if (confirmation) {
    return (
      <Card className="mx-auto w-full max-w-lg p-6 sm:p-8">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Check className="size-5" aria-hidden="true" />
        </div>
        <div className="mt-5">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Almost there</div>
          <h2 className="mt-1 text-2xl font-black tracking-tight">Check your email</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            If this address can receive a Bobaks confirmation email, check your inbox shortly. Confirm your email address, then return to Bobaks and log in.
          </p>
        </div>
        <div className="mt-6 grid gap-2 sm:flex">
          <Button className="sm:flex-1" onClick={() => changeMode("signin")}>
            Back to log in
          </Button>
          <Button
            variant="outline"
            className="sm:flex-1"
            disabled={resendBusy}
            aria-busy={resendBusy}
            onClick={async () => {
              setResendBusy(true);
              setResendMessage("");
              try {
                await client.resendConfirmation(email);
                setResendMessage("If this address needs confirmation, a new email was requested.");
              } catch (cause) {
                setResendMessage(cause instanceof Error ? cause.message : "Could not resend the confirmation email.");
              } finally {
                setResendBusy(false);
              }
            }}
          >
            {resendBusy ? "Sending..." : "Resend confirmation"}
          </Button>
        </div>
        {resendMessage ? <p role="status" className="mt-3 text-xs leading-5 text-muted-foreground">{resendMessage}</p> : null}
      </Card>
    );
  }

  const isSignUp = mode === "signup";

  return (
    <Card className="mx-auto w-full max-w-lg overflow-hidden">
      <div className="p-5 sm:p-8">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {isSignUp ? "New account" : "Welcome back"}
          </div>
          <h2 className="mt-1 text-2xl font-black tracking-tight">
            {isSignUp ? "Create your Bobaks account" : "Log in to Bobaks"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {isSignUp
              ? "Save games, alerts, comparisons, and account preferences across devices."
              : "Access your saved games, alerts, comparisons, and preferences."}
          </p>
        </div>

        <div
          className="mt-6 grid grid-cols-2 rounded-xl border border-border bg-muted/60 p-1"
          aria-label="Account access mode"
        >
          <button
            type="button"
            aria-pressed={!isSignUp}
            className={cn(
              "min-h-10 rounded-lg px-3 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              !isSignUp ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => changeMode("signin")}
          >
            Log in
          </button>
          <button
            type="button"
            aria-pressed={isSignUp}
            className={cn(
              "min-h-10 rounded-lg px-3 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              isSignUp ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => changeMode("signup")}
          >
            Create account
          </button>
        </div>

        <div className="mt-5">
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full justify-center border-border bg-background"
            disabled={loading || busy || googleBusy}
            aria-busy={googleBusy}
            onClick={() => void continueWithGoogle()}
          >
            <span className="flex size-7 items-center justify-center" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="size-6" focusable="false">
                <path fill="#4285F4" d="M21.35 12.25c0-.71-.06-1.4-.18-2.05H12v3.89h5.22a4.46 4.46 0 0 1-1.93 2.93v2.43h3.12c1.83-1.69 2.94-4.18 2.94-7.2z" />
                <path fill="#34A853" d="M12 21.9c2.62 0 4.82-.87 6.42-2.36l-3.12-2.43c-.87.58-1.98.92-3.3.92-2.53 0-4.68-1.71-5.45-4.01H3.33v2.51A9.7 9.7 0 0 0 12 21.9z" />
                <path fill="#FBBC05" d="M6.55 14.02A5.84 5.84 0 0 1 6.25 12c0-.7.12-1.38.3-2.02V7.47H3.33A9.9 9.9 0 0 0 2.25 12c0 1.63.39 3.17 1.08 4.53l3.22-2.51z" />
                <path fill="#EA4335" d="M12 5.97c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.81 3.01 14.62 2.1 12 2.1a9.7 9.7 0 0 0-8.67 5.37l3.22 2.51c.77-2.3 2.92-4.01 5.45-4.01z" />
              </svg>
            </span>
            <span>{googleBusy ? "Redirecting to Google..." : "Continue with Google"}</span>
          </Button>
        </div>

        <div className="my-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>or use email</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-4" onSubmit={submit} noValidate aria-busy={busy}>
          {isSignUp ? (
            <label className="block">
              <span className="text-sm font-semibold">Display name <span className="font-normal text-muted-foreground">(optional)</span></span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={80}
                autoComplete="name"
                className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="How should Bobaks show you?"
              />
            </label>
          ) : null}

          <label className="block">
            <span className="text-sm font-semibold">Email</span>
            <input
              ref={emailRef}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearFieldError("email");
              }}
              type="email"
              required
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "account-email-error" : undefined}
              autoComplete="email"
              className={cn(
                "mt-1 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
                fieldErrors.email
                  ? "border-[var(--signal-drop)] bg-[color-mix(in_srgb,var(--signal-drop)_5%,transparent)] focus-visible:ring-[var(--signal-drop)]"
                  : "border-border",
              )}
              placeholder="you@example.com"
            />
            {fieldErrors.email ? (
              <p id="account-email-error" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--signal-drop)]">
                <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                {fieldErrors.email}
              </p>
            ) : null}
          </label>

          <label className="block">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">Password</span>
              {!isSignUp ? (
                <Link href="/account/reset-password" className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline">
                  Forgot password?
                </Link>
              ) : (
                <span className="text-xs text-muted-foreground">8+ characters</span>
              )}
            </div>
            <div className="relative mt-1">
              <input
                ref={passwordRef}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearFieldError("password");
                }}
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? "account-password-error" : undefined}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                className={cn(
                  "h-11 w-full rounded-xl border bg-background px-3 pr-11 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  fieldErrors.password
                    ? "border-[var(--signal-drop)] bg-[color-mix(in_srgb,var(--signal-drop)_5%,transparent)] focus-visible:ring-[var(--signal-drop)]"
                    : "border-border",
                )}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? (
                  <Eye className="size-4" aria-hidden="true" />
                ) : (
                  <EyeOff className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {fieldErrors.password ? (
              <p id="account-password-error" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--signal-drop)]">
                <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                {fieldErrors.password}
              </p>
            ) : null}
          </label>

          {isSignUp ? (
            <div>
              <label className={cn(
                "flex items-start gap-3 rounded-xl border bg-muted/20 p-3 text-xs leading-5 text-muted-foreground",
                fieldErrors.legal ? "border-[var(--signal-drop)] bg-[color-mix(in_srgb,var(--signal-drop)_5%,transparent)]" : "border-border",
              )}>
                <input
                  ref={legalRef}
                  id="account-legal-consent"
                  type="checkbox"
                  className="mt-1 size-4 shrink-0 rounded accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  checked={legalAccepted}
                  onChange={(event) => {
                    setLegalAccepted(event.target.checked);
                    clearFieldError("legal");
                  }}
                  required
                  aria-invalid={Boolean(fieldErrors.legal)}
                  aria-describedby={fieldErrors.legal ? "account-legal-error" : undefined}
                />
                <span className="min-w-0 flex-1">
                  I agree to the <Link href="/terms" className="font-semibold text-foreground underline underline-offset-2">Terms and Conditions</Link> and acknowledge the <Link href="/privacy" className="font-semibold text-foreground underline underline-offset-2">Privacy Policy</Link>.
                </span>
              </label>
              {fieldErrors.legal ? (
                <p id="account-legal-error" className="mt-1.5 flex items-center gap-1.5 px-1 text-xs font-medium text-[var(--signal-drop)]">
                  <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                  {fieldErrors.legal}
                </p>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <div role="alert" className="rounded-xl border border-[color-mix(in_srgb,var(--signal-drop)_35%,var(--border))] bg-[color-mix(in_srgb,var(--signal-drop)_5%,transparent)] px-3 py-2.5 text-sm leading-5 text-[var(--signal-drop)]">
              {error}
            </div>
          ) : null}

          <Button type="submit" className="h-11 w-full" disabled={loading || busy || googleBusy} aria-busy={busy}>
            {busy ? (isSignUp ? "Creating account..." : "Signing in...") : isSignUp ? "Create Bobaks account" : "Log in to Bobaks"}
          </Button>
        </form>

      </div>
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
  const descriptionId = `bobaks-switch-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="flex min-h-[76px] items-center justify-between gap-5 px-5 py-4 sm:px-6">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-semibold">{label}</div>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            {checked ? "On" : "Off"}
          </span>
        </div>
        <div id={descriptionId} className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
          {description}
        </div>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
        aria-label={label}
        aria-describedby={descriptionId}
      />
    </div>
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
    acceptCurrentLegal,
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

  const hasCurrentLegal = Boolean(
    profile &&
      profile.terms_version === LEGAL_VERSIONS.terms &&
      profile.privacy_version === LEGAL_VERSIONS.privacy,
  );

  async function acceptLegal() {
    setBusy("legal");
    setError("");
    try {
      await acceptCurrentLegal();
      setSaved("Terms and Privacy accepted.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save legal acceptance.");
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

      {error ? <div role="alert" className="rounded-xl border border-[color-mix(in_srgb,var(--signal-drop)_35%,var(--border))] bg-[color-mix(in_srgb,var(--signal-drop)_5%,transparent)] px-4 py-3 text-sm text-[var(--signal-drop)]">{error}</div> : null}
      {saved ? <div role="status" className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">{saved}</div> : null}

      {!hasCurrentLegal ? (
        <Card className="border-primary/30 bg-primary/5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="size-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Required once</div>
              <h2 className="mt-1 text-lg font-black">Review the current Terms and Privacy Policy</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your account needs to accept the current Bobaks Terms and Conditions and Privacy Policy before account features can be used.
              </p>
            </div>
          </div>
          <label className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-background p-3 text-sm">
            <input
              id="account-legal-consent"
              type="checkbox"
              className="mt-1 size-4 shrink-0 accent-foreground"
              required
            />
            <span>
              I agree to the <Link href="/terms" className="font-semibold text-foreground underline underline-offset-2">Terms and Conditions</Link> and acknowledge the <Link href="/privacy" className="font-semibold text-foreground underline underline-offset-2">Privacy Policy</Link>.
            </span>
          </label>
          <Button
            className="mt-4"
            disabled={busy === "legal"}
            onClick={async () => {
              const checkbox = document.getElementById("account-legal-consent") as HTMLInputElement | null;
              if (!checkbox?.checked) {
                setError("Please agree to the Terms and Conditions and Privacy Policy.");
                return;
              }
              await acceptLegal();
            }}
          >
            {busy === "legal" ? "Saving..." : "Agree and continue"}
          </Button>
        </Card>
      ) : null}

      {hasCurrentLegal ? (
        <>
        <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="p-5 pb-4 sm:p-6 sm:pb-5">
            <div className="flex items-center gap-3">
              <UserRound className="size-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <h2 className="font-black">Profile</h2>
                <p className="text-xs text-muted-foreground">Your Bobaks community identity</p>
              </div>
            </div>
          </div>
          <div className="border-t border-border">
            <div className="p-5 sm:p-6">
              <label className="block">
                <span className="text-sm font-semibold">Display name</span>
                <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={80} className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </label>
              <div className="mt-3 text-sm">
                <div className="font-medium">{user?.email}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {user?.email_confirmed_at || user?.confirmed_at ? "Email verified" : "Email confirmation pending"}
                </div>
              </div>
            </div>
            <div className="border-t border-border">
              <ToggleRow label="Public profile" description="Allow your Bobaks profile to be visible when community profile surfaces are introduced." checked={isPublic} onChange={setIsPublic} />
            </div>
            <div className="flex justify-end border-t border-border p-5 sm:p-6">
              <Button onClick={saveProfile} disabled={busy === "profile"} aria-busy={busy === "profile"}>
                {busy === "profile" ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="p-5 pb-4 sm:p-6 sm:pb-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <h2 className="font-black">Alerts</h2>
                <p className="text-xs text-muted-foreground">Choose which account alerts Bobaks sends</p>
              </div>
            </div>
          </div>
          <div className="border-t border-border">
            <ToggleRow label="Enable alerts" description="Master switch for Bobaks account alerts." checked={alertState.alerts_enabled} onChange={(value) => setAlertState((current) => ({ ...current, alerts_enabled: value }))} />
            <div className="border-t border-border">
              <ToggleRow label="Top 10 alerts" description="Alert when a saved game enters the live Top 10." checked={alertState.top10_enabled} onChange={(value) => setAlertState((current) => ({ ...current, top10_enabled: value }))} />
            </div>
            <div className="border-t border-border">
              <ToggleRow label="New peak alerts" description="Alert when Bobaks records a new peak for a saved game." checked={alertState.new_peak_enabled} onChange={(value) => setAlertState((current) => ({ ...current, new_peak_enabled: value }))} />
            </div>
            <div className="border-t border-border">
              <ToggleRow label="Rank jump alerts" description={"Alert when a saved game moves by at least " + alertState.rank_jump_threshold + " ranks."} checked={alertState.rank_jump_enabled} onChange={(value) => setAlertState((current) => ({ ...current, rank_jump_enabled: value }))} />
            </div>
            <div className="border-t border-border p-5 sm:p-6">
              <label className="block">
                <span className="text-sm font-semibold">Rank jump threshold</span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">How many ranks a saved game must move before Bobaks sends a jump alert.</span>
                <input type="number" min={1} max={100} value={alertState.rank_jump_threshold} onChange={(event) => setAlertState((current) => ({ ...current, rank_jump_threshold: Number(event.target.value) }))} className="mt-2 h-10 w-28 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </label>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">Changes are saved when you tap Save alerts.</span>
                <Button onClick={saveAlerts} disabled={busy === "alerts"} aria-busy={busy === "alerts"}>
                  {busy === "alerts" ? "Saving..." : "Save alerts"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5 sm:p-6 opacity-60">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-black">Roblox identity</h2>
            <p className="mt-1 text-sm text-muted-foreground">Connect only when you choose. Bobaks stores the Roblox identity separately from your account.</p>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">Connect to Roblox is not yet available.</p>
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
            <Button className="mt-4" onClick={connectRoblox} disabled>{busy === "roblox" ? "Opening Roblox..." : "Connect Roblox"}</Button>
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
        </>
      ) : null}
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
        <Link href="/" className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Home
        </Link>
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Account</div>
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Log in or create an account</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Save games, alerts, comparisons, and preferences across devices.
        </p>
      </section>
      <AuthForm />
    </div>
  );
}
