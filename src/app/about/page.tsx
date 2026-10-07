import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata = {
  alternates: { canonical: "/about" },
  title: "About",
  description: "About Bobaks Ranking.",
};

export default function AboutPage() {
  return <PagePlaceholder eyebrow="About Bobaks" title="Independent Roblox analytics" description="Bobaks Ranking is a fan-made analytics project for exploring Roblox experience rankings and historical trends. It is not officially affiliated with Roblox Corporation." />;
}
