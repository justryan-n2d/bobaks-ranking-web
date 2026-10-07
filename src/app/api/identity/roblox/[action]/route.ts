const API_ORIGIN = process.env.BOBAKS_API_ORIGIN?.replace(/\/$/, "") || "https://bobaks-ranking-api-service.bobaksranking.workers.dev";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> },
) {
  const { action } = await params;
  if (!["start", "exchange", "disconnect"].includes(action)) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");
  const contentType = request.headers.get("content-type");
  if (authorization) headers.set("authorization", authorization);
  if (cookie) headers.set("cookie", cookie);
  if (contentType) headers.set("content-type", contentType);
  headers.set("accept", "application/json");

  const response = await fetch(API_ORIGIN + "/api/identity/roblox/" + action, {
    method: "POST",
    headers,
    body: action === "start" || action === "disconnect" ? undefined : await request.text(),
    cache: "no-store",
  });

  const out = new Headers(response.headers);
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) out.set("set-cookie", setCookie);
  out.set("cache-control", "no-store");
  return new Response(response.body, { status: response.status, headers: out });
}
