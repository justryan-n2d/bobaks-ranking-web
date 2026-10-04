import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata = {
  title: "Account",
  description: "Optional Bobaks Ranking account.",
};

export default function AccountPage() {
  return (
    <PagePlaceholder
      eyebrow="Account"
      title="Your Bobaks account"
      description="Accounts remain optional. This route will become the frontend entry point for the Phase 6.7 profile, watchlist, alert, and identity features."
    />
  );
}
