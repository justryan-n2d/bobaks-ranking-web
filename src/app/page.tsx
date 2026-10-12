import { HomeDiscovery } from "@/components/home-discovery";
import { getRankings, getSocialFeed } from "@/lib/api";

export default async function HomePage() {
  const [rankingResult, feedResult] = await Promise.allSettled([
    getRankings("live"),
    getSocialFeed("live"),
  ]);

  return (
    <HomeDiscovery
      initialResponse={rankingResult.status === "fulfilled" ? rankingResult.value : null}
      initialFeed={feedResult.status === "fulfilled" ? feedResult.value : null}
    />
  );
}
