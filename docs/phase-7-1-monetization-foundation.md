# Phase 7.1 Monetization Foundation

## Current state

Bobaks is monetization-ready but monetization remains disabled.

The foundation defines the boundary between the public ranking product and future monetization providers. No ad network SDK, sponsorship creative, payment flow, or premium restriction is active.

## Free core

These remain public and free:

- Live rankings
- Historical rankings and historical views
- Game search
- Basic statistics

Monetization must not block the main reason users visit Bobaks.

## Approved ad placements

The frontend reserves three logical slot IDs:

- `content-top`
- `content-mid`
- `footer`

No ranking-card overlay slot exists. Ads must never cover rankings, controls, navigation, or other interactive product UI.

The current shell mounts only the `content-top` boundary. It renders no space or placeholder while monetization is disabled.

## Activation boundary

Ads may be activated only after these decisions are complete:

1. Choose and approve an ad provider.
2. Review the provider's current privacy, consent, cookie, and data-processing requirements against Bobaks' legal pages and deployment model.
3. Establish the actual recurring operating-cost baseline.
4. Add privacy-appropriate monetization analytics.
5. Add and verify the provider adapter.
6. QA desktop and mobile layouts before enabling production traffic.

The public flag is `NEXT_PUBLIC_BOBAKS_ADS_ENABLED=true`. The provider identifier is supplied through `NEXT_PUBLIC_BOBAKS_AD_PROVIDER`.

Readiness requires both an explicit enable flag and a configured provider. The current provider is `none`, so production readiness remains false.

## Provider boundary

`src/components/ad-slot.tsx` is intentionally provider-neutral. It accepts a logical Bobaks slot and optional rendered provider content. It does not load scripts, call third-party APIs, or manufacture ad content.

A future provider integration should supply the rendered content through this boundary instead of modifying ranking cards or data-fetching components.

## Monetization event contract

The frontend defines these event names for future analytics integration:

- `ad_impression`
- `ad_click`
- `sponsor_impression`
- `sponsor_click`

Events must not include authentication tokens, secrets, or player-level Roblox information.

## Financial baseline

Track monthly operating cost by service before enabling paid infrastructure:

| Service | Baseline input |
| --- | --- |
| Supabase | Current plan and actual recurring/usage cost |
| Cloudflare | Current plan and actual recurring/usage cost |
| Cloudflare R2 | Storage, operations, and egress cost |
| Domain | Renewal cost and renewal date |
| Other services | Any recurring production dependency |

The first Phase 7 financial target is simple: recurring monetization revenue should eventually exceed recurring operating cost. No current dollar amount is assumed by this document.

## Explicit non-goals for this foundation

This change does not:

- choose an ad provider
- enable ads in production
- add sponsorship content
- add premium paywalls
- collect ad revenue
- add a payment provider
- change ranking algorithms or ranking data rules
