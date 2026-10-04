import { PagePlaceholder } from "@/components/page-placeholder";
import { WatchlistPage } from "@/components/watchlist-page";

export const metadata = {
  title: "Watchlist",
  description: "Your saved Bobaks Ranking games.",
};

export default function SavedPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Watchlist</div>
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Games you care about</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Save games without signing in. Account-backed cross-device sync can be connected later.
        </p>
      </div>
      <WatchlistPage />
      <div className="text-xs text-muted-foreground">
        Guest saves are stored only in your browser. They are not uploaded to Bobaks.
      </div>
    </div>
  );
}
