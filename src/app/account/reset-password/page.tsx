"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";

import { useAuth } from "@/components/account-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const { client } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await client.resetPasswordForEmail(email);
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send the password reset email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg py-10">
      <Link href="/account" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to account
      </Link>

      <Card className="mt-5 p-6 sm:p-8">
        {sent ? (
          <>
            <MailCheck className="size-7" aria-hidden="true" />
            <h1 className="mt-5 text-2xl font-black">Check your email</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              If a Bobaks account uses <strong>{email}</strong>, a password reset link has been sent. Open it to choose a new password.
            </p>
            <Link href="/account" className="mt-5 inline-flex h-10 items-center rounded-xl bg-foreground px-4 text-sm font-semibold text-background">
              Back to log in
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-black">Reset your password</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Enter your email and Bobaks will send a reset link. We do not reveal whether an account exists for the address.
            </p>
            <form className="mt-5 space-y-4" onSubmit={submit}>
              <label className="block">
                <span className="text-sm font-semibold">Email</span>
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required autoComplete="email" className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </label>
              {error ? <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</div> : null}
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Sending..." : "Send reset link"}</Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
