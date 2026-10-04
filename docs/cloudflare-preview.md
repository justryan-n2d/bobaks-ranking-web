# Cloudflare Preview

Bobaks Ranking Web uses Cloudflare Workers Previews for non-production branches.

- Production branch: `main`
- Preview builds: enabled for non-production branches
- Build command: `npm run build:vinext`
- Preview command: `npx wrangler preview`
- Root directory: `/`

Each push to `feat/**` or another non-production branch should update that branch's isolated Worker Preview.

Preview verification trigger: 2026-10-05

Deployment retry verification: 2

## Preview demo data mode

Cloudflare Worker Previews use deterministic frontend QA data without changing the real Bobaks API or database. The Wrangler `previews.vars` block sets `BOBAKS_UI_DEMO_MODE=true` and `BOBAKS_DEPLOYMENT_ENV=preview`; production explicitly sets both values to disable demo mode. Cloudflare documents that Preview settings are isolated from production and configured through the `previews` block. citeturn0search0turn0search3

Demo mode is frontend-only. The API client switches rankings, social feed, search, game profiles, history, rank history, and peaks to deterministic fixtures. The same client is used by `/api/rankings/live`, so the 30-second live refresh is also deterministic in Preview.

Never seed demo records into Supabase or the production Bobaks API. Production keeps using the real API because its Wrangler variables explicitly disable the mode.
