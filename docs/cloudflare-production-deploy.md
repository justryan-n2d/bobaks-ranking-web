# Cloudflare Production Deployment

Bobaks Ranking Web uses Vinext with the Cloudflare Vite plugin. Deploy the **generated Wrangler configuration** produced by the production build.

## Workers Builds settings

In Cloudflare, open **Workers & Pages → web → Settings → Builds** and verify these settings:

| Setting | Value |
| --- | --- |
| Root directory | `/` (repository root) |
| Production branch | `main` |
| Build command | `npm run build:vinext` |
| Deploy command | `npm run deploy:vinext` |

The deploy script runs:

```sh
wrangler deploy --config dist/server/wrangler.json
```

Run the build before the deploy command. The generated config uses `dist/server/index.js` as its Worker entrypoint and points its assets binding at the generated client assets. It is not equivalent to deploying the source `wrangler.jsonc` directly: the source config points at `vinext/server/fetch-handler`, whereas the generated config points at the built Worker.

Do not set the deploy command to plain `npx wrangler deploy` for this setup unless the Cloudflare integration explicitly selects the generated config. Plain Wrangler deploy defaults to the root config if no `--config` is supplied.

## Verify after deployment

After a production build is deployed, check these routes:

- `/api/deployment` should return JSON with a `release` field.
- `/sitemap.xml` should return an XML `urlset` containing the configured `BOBAKS_SITE_ORIGIN` URLs, including `/rankings/live`.
- `/api/rankings/live` should return HTTP 200 with a non-empty `data` array.

The Frontend CI workflow tests these routes in the generated Wrangler Worker, while Production QA tests the public production endpoint. If generated-Worker CI passes but production QA gets 404s, compare the Worker version's deployed commit and the actual Cloudflare Builds settings before changing application routes.

## Safety boundary

This deployment procedure only changes how the frontend Worker bundle is built and deployed. The ranking engine, collector, API backend, historical database, and retention logic remain in `bobaks-ranking-api` and are not changed by frontend deploys.
