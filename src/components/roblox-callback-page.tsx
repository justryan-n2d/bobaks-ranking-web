"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, ShieldAlert, CheckCircle2 } from "lucide-react";

import { useAuth } from "@/components/account-provider";
import { Card } from "@/components/ui/card";

export function RobloxCallbackPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { client, user, loading } = useAuth();
  const [message, setMessage] = useState("Finishing Roblox connection...");
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setError("Your Bobaks session is no longer available. Log in again and restart the Roblox connection.");
      return;
    }

    const code = params.get("code");
    const state = params.get("state");
    const providerError = params.get("error");

    if (providerError) {
      setError("Roblox cancelled or rejected the authorization request.");
      return;
    }
    if (!code || !state) {
      setError("The Roblox callback is missing its authorization state.");
      return;
    }

    let cancelled = false;
    void client.exchangeRobloxConnection(code, state)
      .then(() => {
        if (cancelled) return;
        setMessage("Roblox account connected.");
        window.setTimeout(() => router.replace("/account?roblox=connected"), 250);
      })
      .catch((cause) => {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : "Roblox connection could not be completed.");
      });

    return () => { cancelled = true; };
  }, [client, loading, params, router, user]);

  return (
    <div className="mx-auto max-w-2xl py-12">
      <Card className="p-7 sm:p-9">
        {error ? (
          <>
            <ShieldAlert className="size-7 text-destructive" aria-hidden="true" />
            <h1 className="mt-5 text-2xl font-black">Roblox connection failed</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{error}</p>
            <button type="button" onClick={() => router.replace("/account")} className="mt-5 inline-flex h-10 items-center rounded-xl bg-foreground px-4 text-sm font-semibold text-background">
              Back to account
            </button>
          </>
        ) : (
          <>
            {message === "Roblox account connected." ? (
              <CheckCircle2 className="size-7" aria-hidden="true" />
            ) : (
              <LoaderCircle className="size-7 animate-spin" aria-hidden="true" />
            )}
            <h1 className="mt-5 text-2xl font-black">{message}</h1>
            <p className="mt-2 text-sm text-muted-foreground">This page does not store Roblox access or refresh tokens in your browser.</p>
          </>
        )}
      </Card>
    </div>
  );
}
