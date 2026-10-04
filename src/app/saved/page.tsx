import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata = {
  title: "Watchlist",
  description: "Your saved Bobaks Ranking games.",
};

export default function SavedPage() {
  return (
    <PagePlaceholder
      eyebrow="Watchlist"
      title="Your saved games"
      description="This route is reserved for the guest device-local list and the Phase 6.7 persistent account-backed list."
    />
  );
}
