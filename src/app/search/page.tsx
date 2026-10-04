import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata = {
  title: "Search",
  description: "Search Roblox experiences and creators on Bobaks Ranking.",
};

export default function SearchPage() {
  return (
    <PagePlaceholder
      eyebrow="Bobaks Search"
      title="Search games and creators"
      description="The dedicated search experience is next. It will consume the existing Bobaks search API without exposing raw search text to product analytics."
    />
  );
}
