import type { MetadataRoute } from "next";

const SITE_ORIGIN = (
  process.env.BOBAKS_SITE_ORIGIN || "https://web.bobaksranking.workers.dev"
).replace(/\/$/, "");

const IS_PREVIEW = process.env.BOBAKS_DEPLOYMENT_ENV === "preview";

export default function robots(): MetadataRoute.Robots {
  if (IS_PREVIEW) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/account",
        "/saved",
        "/compare",
        "/search",
      ],
    },
    sitemap: SITE_ORIGIN + "/sitemap.xml",
  };
}
