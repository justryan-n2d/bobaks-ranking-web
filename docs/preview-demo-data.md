# Preview Demo Data Mode

The frontend has an isolated deterministic demo-data mode for QA when the production Bobaks API has no ranking records yet.

## Enable it

Set these environment variables **only on the Cloudflare Worker Preview environment**:

```text
BOBAKS_DEPLOYMENT_ENV=preview
BOBAKS_UI_DEMO_MODE=true
```

Do not set either value for the production `main` deployment.

The mode is intentionally guarded by both variables. Setting `BOBAKS_UI_DEMO_MODE=true` without `BOBAKS_DEPLOYMENT_ENV=preview` does not enable demo data.

## What it covers

The fixture set provides:

- Live, weekly, monthly, and yearly rankings
- Rank movement and player-count-like scores
- Search results
- Game profiles
- Snapshot history
- Rank history
- Peak records
- Social/trending/peak feed data
- Active game states

The fixtures are deterministic, so the same QA run sees the same game IDs and values.

## Production safety

Demo data is generated entirely inside the web repository. It is not written to Supabase, the production API, or the collector.

With the preview variables unset, all data functions continue to call the configured Bobaks API.

## QA flow

Use the Cloudflare branch preview to exercise:

1. Home discovery
2. Live/weekly/monthly/yearly ranking pages
3. Search
4. Game profile and charts
5. Compare/watchlist flows that depend on game IDs
6. Empty/error states separately with demo mode disabled
7. Mobile navigation and responsive layouts

This mode is a frontend QA aid. It does not replace real-data integration testing after the backend has ranking records.
