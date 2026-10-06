# Bobaks Workers.dev hostname migration

## Target

- Website: `https://web.bobaksranking.workers.dev`
- API: `https://bobaks-ranking-api-service.bobaksranking.workers.dev`
- Collector: `https://bobaks-ranking-collector.bobaksranking.workers.dev`
- Account subdomain: `bobaksranking`

Cloudflare documents the Workers.dev format as `<WORKER_NAME>.<ACCOUNT_SUBDOMAIN>.workers.dev`. Changing the account subdomain therefore affects every Workers.dev URL in the account.

## Safe rollout

1. Prepare application and QA references on isolated branches.
2. Verify the branches without deploying to production.
3. In Cloudflare, change the account Workers.dev subdomain from `ryan-oledan0` to `bobaksranking`.
4. Deploy/merge the prepared branches so the frontend Worker name becomes `web`.
5. Verify the website, API, collector, authentication callbacks, production smoke tests, and monitoring.
6. Keep the old hostnames as rollback references until the new endpoints have been confirmed.

## Important

This migration does not change Supabase data, ranking calculations, collection logic, or database schemas.

The frontend's production API origin is also changed because the API Worker receives the new account subdomain.

Google/Supabase OAuth uses the browser origin for the application callback, but provider allowlists must still be updated to the final public hostname before real production Google sign-in is tested.

Do not merge the prepared production-hostname changes until the Cloudflare account subdomain has been changed. Otherwise the application code would point at the new hostnames before those hostnames exist.
