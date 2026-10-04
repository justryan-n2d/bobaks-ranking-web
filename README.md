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

```bash
npm install
npm run dev
```

Verification:

```bash
npm test
npm run build
```

The server-side API client defaults to the production Bobaks API. Set `BOBAKS_API_ORIGIN` for another environment.

## Product boundary

Core rankings, search, historical data, collection, and ranking methodology remain owned by the production API. This website consumes those public JSON contracts rather than duplicating backend logic.