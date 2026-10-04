import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Experience ${id}`,
    description: `Bobaks Ranking game profile for Roblox experience ${id}.`,
  };
}

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Home
      </Link>

      <Card>
        <CardHeader>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Game profile</div>
          <CardTitle>Experience {id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
          <p>
            This route is the foundation for the full Bobaks game profile: current players, rank, Recorded Peak,
            history, trend, metadata, and sharing.
          </p>
          <a
            href={`https://www.roblox.com/games/${encodeURIComponent(id)}`}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 font-semibold text-foreground hover:underline"
          >
            Open on Roblox
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
