"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LoaderCircle, Save } from "lucide-react";

import { useAuth } from "@/components/account-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { loading, session, client } = useAuth();
  const [ready, setReady] = useState(false);
  const [sessionAvailable, setSessionAvailable] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (loading) return;
    setSessionAvailable(Boolean(session));
    if (!session) setError("This password reset link is missing or has expired.");
    setReady(true);
  }, [loading, session]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await client.updatePassword(password);
      setMessage("Password updated. You can now use it to log in.");
      setPassword("");
      setConfirmation("");
      window.setTimeout(() => router.replace("/account"), 800);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update your password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg py-10">
      <Card className="p-6 sm:p-8">
        {!ready ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Checking reset link...</div>
        ) : (
          <>
            <Save className="size-7" aria-hidden="true" />
            <h1 className="mt-5 text-2xl font-black">Choose a new password</h1>
            {error ? <div role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</div> : null}
            {message ? <div role="status" className="mt-4 rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm">{message}</div> : null}
            {sessionAvailable ? (
              <form className="mt-5 space-y-4" onSubmit={submit}>
                <label className="block">
                  <span className="text-sm font-semibold">New password</span>
                  <div className="relative mt-1">
                    <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} minLength={8} required autoComplete="new-password" className="h-11 w-full rounded-xl border border-border bg-background px-3 pr-11 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    <button type="button" className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((current) => !current)}>
                      {showPassword ? <Eye className="size-4" aria-hidden="true" /> : <EyeOff className="size-4" aria-hidden="true" />}
                    </button>
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Confirm new password</span>
                  <div className="relative mt-1">
                    <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} type={showConfirmation ? "text" : "password"} minLength={8} required autoComplete="new-password" className="h-11 w-full rounded-xl border border-border bg-background px-3 pr-11 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    <button type="button" className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring" aria-label={showConfirmation ? "Hide confirmation password" : "Show confirmation password"} aria-pressed={showConfirmation} onClick={() => setShowConfirmation((current) => !current)}>
                      {showConfirmation ? <Eye className="size-4" aria-hidden="true" /> : <EyeOff className="size-4" aria-hidden="true" />}
                    </button>
                  </div>
                </label>
                <Button type="submit" className="w-full" disabled={busy || Boolean(message)}>{busy ? "Saving..." : "Update password"}</Button>
              </form>
            ) : null}
            <Link href="/account" className="mt-5 inline-flex text-sm font-semibold hover:underline">Back to account</Link>
          </>
        )}
      </Card>
    </div>
  );
}
