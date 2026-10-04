import { getRankings } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await getRankings("live");
    return Response.json(response, {
      headers: {
        "cache-control": "no-store",
      },
    });
  } catch {
    return Response.json(
      { error: "Live ranking data is temporarily unavailable." },
      { status: 502 },
    );
  }
}
