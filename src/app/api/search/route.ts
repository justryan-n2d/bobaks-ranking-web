import { searchGames } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim().slice(0, 100);

  if (query.length < 2) {
    return Response.json({ data: [] as unknown[] }, {
      headers: { "cache-control": "no-store" },
    });
  }

  try {
    const data = await searchGames(query);
    return Response.json({ data }, {
      headers: { "cache-control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "Search is temporarily unavailable." },
      { status: 502, headers: { "cache-control": "no-store" } },
    );
  }
}
