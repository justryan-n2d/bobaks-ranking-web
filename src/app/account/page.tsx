import { AccountPage } from "@/components/account-page";

export const metadata = {
  title: "Account",
  description: "Optional Bobaks Ranking account.",
  robots: { index: false, follow: false },
};

export default function AccountRoute() {
  return <AccountPage />;
}
