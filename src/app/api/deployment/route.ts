export const dynamic = "force-dynamic";

const RELEASE_ID = "cloudflare-generated-worker-deploy-20261009-v2";

export function GET() {
  return Response.json(
    { release: RELEASE_ID },
    { headers: { "cache-control": "no-store" } },
  );
}
