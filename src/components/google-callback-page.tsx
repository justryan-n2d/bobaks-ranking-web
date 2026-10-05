"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, LoaderCircle, ShieldAlert } from "lucide-react";

import { useAuth } from "@/components/account-provider";
import { Card } from "@/components/ui/card";

export function GoogleCallbackPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { client, loading, refreshAccount } = useAuth();
  const [message, setMessage] = useState("Finishing Google sign-in...");
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;

    const providerError = params.get("error");
    const code = params.get("code");

    if (providerError) {
      setError("Google sign-in was cancelled or rejected.");
      return;
    }
    if (!code) {
      setError("The Google callback is missing its authorization code.");
      return;
    }

    let cancelled = false;
    void client.exchangeGoogleAuthCode(code)
      .then(async () => {
        if (cancelled) return;
        await refreshAccount();
        if (cancelled) return;
        setMessage("Signed in with Google.");
        window.setTimeout(() => router.replace("/account?google=connected"), 250);
      })
      .catch((cause) => {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : "Google sign-in could not be completed.");
      });

    return () => { cancelled = true; };
  }, [client, loading, params, refreshAccount, router]);

  return (
    <div className="mx-auto max-w-2xl py-12">
      <Card className="p-7 sm:p-9">
        {error ? (
          <>
            <ShieldAlert className="size-7 text-destructive" aria-hidden="true" />
            <h1 className="mt-5 text-2xl font-black">Google sign-in failed</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={() => router.replace("/account")}
              className="mt-5 inline-flex h-10 items-center rounded-xl bg-foreground px-4 text-sm font-semibold text-background"
            >
              Back to account
            </button>
          </>
        ) : (
          <>
            {message === "Signed in with Google." ? (
              <CheckCircle2 className="size-7" aria-hidden="true" />
            ) : (
              <LoaderCircle className="size-7 animate-spin" aria-hidden="true" />
            )}
            <h1 className="mt-5 text-2xl font-black">{message}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Google is used only to authenticate your Bobaks account. Roblox remains a separate optional identity connection.
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
