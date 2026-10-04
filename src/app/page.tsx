import { getRankings, getSocialFeed } from "@/lib/api";
import { HomeDiscovery } from "@/components/home-discovery";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [liveResult, feedResult] = await Promise.allSettled([
    getRankings("live"),
    getSocialFeed("live"),
  ]);

  const liveResponse = liveResult.status === "fulfilled" ? liveResult.value : null;
  const liveGames = liveResponse?.data ?? [];
  const feed = feedResult.status === "fulfilled" ? feedResult.value : null;

  return <HomeDiscovery liveGames={liveGames} liveUpdatedAt={liveResponse?.updatedAt ?? null} feed={feed} />;
}
