const DEFAULT_API_ORIGIN =
  "https://bobaks-ranking-api-service.bobaksranking.workers.dev";
const GAME_PAGE_SIZE = 100;

type GameRow = {
  id?: string | number | null;
  updatedAt?: string | null;
};

function apiOrigin(): string {
  return (process.env.BOBAKS_API_ORIGIN || DEFAULT_API_ORIGIN).replace(/\/$/, "");
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (character) => {
    switch (character) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return character;
    }
  });
}

function urlEntry(origin: string, pathname: string, priority: string, changefreq: string, lastmod?: string) {
  return (
    "<url><loc>" +
    escapeXml(new URL(pathname, origin).toString()) +
    "</loc>" +
    (lastmod ? "<lastmod>" + escapeXml(lastmod) + "</lastmod>" : "") +
    "<changefreq>" +
    changefreq +
    "</changefreq><priority>" +
    priority +
    "</priority></url>"
  );
}

async function fetchGameCatalog(): Promise<GameRow[]> {
  const rows: GameRow[] = [];
  let offset = 0;

  while (true) {
    const response = await fetch(
      apiOrigin() + "/api/games?limit=" + GAME_PAGE_SIZE + "&offset=" + offset,
      {
        headers: { accept: "application/json" },
        cache: "no-store",
      },
    );

    if (!response.ok) break;

    const payload = (await response.json()) as { data?: GameRow[] };
    const page = Array.isArray(payload.data) ? payload.data : [];
    rows.push(...page);

    if (page.length < GAME_PAGE_SIZE) break;
    offset += GAME_PAGE_SIZE;
  }

  return rows;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request): Promise<Response> {
  const origin = new URL(request.url).origin;
  const urls = [
    urlEntry(origin, "/", "1.0", "hourly"),
    urlEntry(origin, "/rankings/weekly", "0.8", "hourly"),
    urlEntry(origin, "/rankings/monthly", "0.8", "hourly"),
    urlEntry(origin, "/rankings/yearly", "0.8", "hourly"),
    urlEntry(origin, "/community", "0.5", "weekly"),
    urlEntry(origin, "/about", "0.5", "monthly"),
    urlEntry(origin, "/methodology", "0.6", "monthly"),
    urlEntry(origin, "/privacy", "0.2", "yearly"),
    urlEntry(origin, "/terms", "0.2", "yearly"),
  ];

  try {
    const gameRows = await fetchGameCatalog();

    for (const game of gameRows) {
      const id = String(game.id ?? "");
      if (!/^\d{1,20}$/.test(id)) continue;

      const parsedLastmod = Date.parse(String(game.updatedAt ?? ""));
      const lastmod = Number.isFinite(parsedLastmod)
        ? new Date(parsedLastmod).toISOString()
        : undefined;

      urls.push(
        urlEntry(
          origin,
          "/game/" + encodeURIComponent(id),
          "0.8",
          "hourly",
          lastmod,
        ),
      );
    }
  } catch {
    // Keep the public sitemap available during temporary API failures.
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls.join("") +
    "</urlset>";

  return new Response(xml, {
    status: 200,
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=900",
    },
  });
}
