import { getSocialFeed } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await getSocialFeed("live");
    return Response.json(response, {
      headers: {
        "cache-control": "no-store",
      },
    });
  } catch {
    return Response.json(
      { error: "Social feed data is temporarily unavailable." },
      { status: 502 },
    );
  }
}
