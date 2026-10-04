export type NavItem = {
  label: string;
  href: string;
  section?: "main" | "info";
  icon: "home" | "rankings" | "search" | "saved" | "compare" | "community" | "info";
};

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Home", href: "/", section: "main", icon: "home" },
  { label: "Live", href: "/rankings/live", section: "main", icon: "rankings" },
  { label: "This Week", href: "/rankings/weekly", section: "main", icon: "rankings" },
  { label: "This Month", href: "/rankings/monthly", section: "main", icon: "rankings" },
  { label: "This Year", href: "/rankings/yearly", section: "main", icon: "rankings" },
  { label: "Search", href: "/search", section: "main", icon: "search" },
  { label: "Watchlist", href: "/saved", section: "main", icon: "saved" },
  { label: "Compare", href: "/compare", section: "main", icon: "compare" },
  { label: "Community", href: "/community", section: "main", icon: "community" },
  { label: "About", href: "/about", section: "info", icon: "info" },
  { label: "Methodology", href: "/methodology", section: "info", icon: "info" },
  { label: "Privacy", href: "/privacy", section: "info", icon: "info" },
  { label: "Terms", href: "/terms", section: "info", icon: "info" },
];
