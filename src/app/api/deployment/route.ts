export const dynamic = "force-dynamic";

const RELEASE_ID = "sitemap-dynamic-cache-fix-20261009";

export function GET() {
  return Response.json(
    { release: RELEASE_ID },
    { headers: { "cache-control": "no-store" } },
  );
}
