"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, LoaderCircle, ShieldAlert } from "lucide-react";

import { useAuth } from "@/components/account-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function GoogleCallbackPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { client, loading, refreshAccount } = useAuth();
  const [status, setStatus] = useState<"working" | "success" | "error">("working");
  const [message, setMessage] = useState("Finishing Google sign-in...");
  const [error, setError] = useState("");
  const exchangeStarted = useRef(false);

  useEffect(() => {
    if (loading) return;

    const providerError = params.get("error");
    const code = params.get("code");

    if (providerError) {
      setStatus("error");
      setError("Google sign-in was cancelled or rejected. You can try again from the Bobaks account page.");
      return;
    }

    if (!code) {
      setStatus("error");
      setError("The Google callback is missing its authorization code. Please start Google sign-in again.");
      return;
    }

    if (exchangeStarted.current) return;
    exchangeStarted.current = true;

    let cancelled = false;

    void client.exchangeGoogleAuthCode(code)
      .then(async () => {
        if (cancelled) return;
        await refreshAccount();
        if (cancelled) return;
        setStatus("success");
        setMessage("Signed in with Google.");
        window.setTimeout(() => router.replace("/account"), 400);
      })
      .catch((cause) => {
        if (cancelled) return;
        setStatus("error");
        setError(cause instanceof Error ? cause.message : "Google sign-in could not be completed.");
      });

    return () => {
      cancelled = true;
    };
  }, [client, loading, params, refreshAccount, router]);

  const goBack = () => router.replace("/account");

  return (
    <div className="mx-auto w-full max-w-2xl py-8 sm:py-12">
      <Card className="overflow-hidden">
        <div className="p-6 sm:p-9" role={status === "working" ? "status" : "alert"} aria-live="polite">
          {status === "error" ? (
            <>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <ShieldAlert className="size-6" aria-hidden="true" />
              </div>
              <div className="mt-5">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Google authentication</div>
                <h1 className="mt-1 text-2xl font-black tracking-tight">Sign-in could not be completed</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{error}</p>
              </div>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button onClick={goBack} className="sm:flex-1">Try again</Button>
                <Button variant="outline" onClick={() => router.replace("/")} className="sm:flex-1">
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Back to Bobaks
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className={`flex size-12 items-center justify-center rounded-2xl ${status === "success" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {status === "success" ? (
                  <CheckCircle2 className="size-6" aria-hidden="true" />
                ) : (
                  <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
                )}
              </div>
              <div className="mt-5">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {status === "success" ? "Complete" : "Secure sign-in"}
                </div>
                <h1 className="mt-1 text-2xl font-black tracking-tight">{message}</h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  {status === "success"
                    ? "Your Bobaks session is ready. Returning you to your account..."
                    : "Google is being used only to authenticate your Bobaks account. Roblox remains a separate optional identity connection."}
                </p>
              </div>
              {status === "working" ? (
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <span className="bobaks-status-dot" aria-hidden="true" />
                  Verifying your secure sign-in request
                </div>
              ) : null}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
