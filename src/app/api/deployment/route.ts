export const dynamic = "force-dynamic";

const RELEASE_ID = "seo-server-rendered-content-20261013-v1";

export function GET() {
  return Response.json(
    { release: RELEASE_ID },
    { headers: { "cache-control": "no-store" } },
  );
}
