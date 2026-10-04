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
