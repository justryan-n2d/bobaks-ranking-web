# Bobaks Ranking Web

The gamer-facing website for Bobaks Ranking.

## Architecture

This repository contains only the web application. The production API, collector, ranking engine, historical data, and backend security logic remain in `bobaks-ranking-api`.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- TailwindCSS 4
- shadcn/ui
- Recharts
- Cloudflare Workers as the target deployment environment

## Development

Install and run locally with `npm install` and `npm run dev`. Verify with `npm test` and `npm run build`.

Node.js 22.12 or newer is required by the frontend toolchain.

The server-side API client defaults to the production Bobaks API. Set `BOBAKS_API_ORIGIN` for another environment.

### Preview demo data

Cloudflare Worker Previews use deterministic frontend fixtures so the UI can be tested even when the production ranking dataset is empty. Preview deployments set `BOBAKS_DEPLOYMENT_ENV=preview` and `BOBAKS_UI_DEMO_MODE=true`; production explicitly sets both values to disable demo data.

Run `npx wrangler preview` from the feature branch to create or update the isolated Preview. Demo fixtures never write to Supabase or the production API. They cover rankings, social feed, search, game profiles, history, rank history, peak records, rank movement, and a new-entry case.

The Preview shell shows a visible demo-mode banner so QA cannot mistake fixtures for live Bobaks data. The demo source is also used by the same-origin `/api/rankings/live` refresh route, so the Home live board stays populated during testing.

## Product boundary

Core rankings, search, historical data, collection, and ranking methodology remain owned by the production API. This website consumes those public JSON contracts rather than duplicating backend logic.
