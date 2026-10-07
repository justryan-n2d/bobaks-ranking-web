import Link from "next/link";
import { MessageCircle, ShieldCheck, Sparkles, Users } from "lucide-react";

import { Card } from "@/components/ui/card";

export const metadata = {
  alternates: { canonical: "/community" },
  title: "Community",
  description: "The Bobaks Ranking community hub.",
};

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <section>
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Community</div>
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">A community foundation, not a social wall yet</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Bobaks keeps community participation optional. Your account gives you a stable Bobaks identity today, while posts, comments, follows, and creator identity can build on it later.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <Users className="size-5" aria-hidden="true" />
          <h2 className="mt-4 font-black">Your identity</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Choose a display name and whether your profile can appear in future public community surfaces.</p>
          <Link href="/account" className="mt-4 inline-flex text-sm font-semibold hover:underline">Open account</Link>
        </Card>
        <Card className="p-5">
          <ShieldCheck className="size-5" aria-hidden="true" />
          <h2 className="mt-4 font-black">Identity stays separate</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">A Bobaks account is separate from Roblox. Connecting Roblox is explicit, optional, and revocable.</p>
          <Link href="/account" className="mt-4 inline-flex text-sm font-semibold hover:underline">Manage identity</Link>
        </Card>
        <Card className="p-5">
          <Sparkles className="size-5" aria-hidden="true" />
          <h2 className="mt-4 font-black">Future community tools</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">The identity layer is ready for future posts, comments, follows, creator profiles, and supporter history without making accounts mandatory.</p>
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="size-5" aria-hidden="true" />
          <div>
            <h2 className="font-black">Keep browsing without an account</h2>
            <p className="mt-1 text-sm text-muted-foreground">Rankings, game profiles, history, and search remain available to guests.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
