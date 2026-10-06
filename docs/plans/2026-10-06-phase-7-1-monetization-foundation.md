# Phase 7.1 Monetization Foundation Implementation Plan

> **For agentic workers:** Use the host's available task-by-task implementation workflow. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a provider-neutral monetization foundation that defines safe ad placements and monetization event contracts while keeping all monetization disabled by default.

**Architecture:** A single client-safe configuration module owns monetization feature flags and approved slot policy. A small `AdSlot` component consumes that policy and renders nothing unless ads are explicitly enabled, so future provider code cannot affect the ranking UI by default. Monetization event names and payload shapes are defined separately for later analytics integration.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest 5, Tailwind CSS.

## Global Constraints

- Ads remain disabled by default.
- No ad network SDK, sponsor content, or premium paywall is introduced by this foundation.
- The core live rankings, historical rankings, search, and basic statistics remain free.
- Approved monetization slots must not cover ranking content or create fake controls.
- The system must be safe on mobile and must not reserve visible ad space when monetization is disabled.
- Sponsorship must remain clearly distinguishable from Bobaks functionality.
- Monetization events must not contain player-level Roblox data or authentication secrets.

---

### Task 1: Monetization policy and feature flags

**Files:**
- Create: `src/lib/monetization.ts`
- Create: `tests/monetization.test.ts`

**Interfaces:**
- Produces `MONETIZATION_CONFIG`, `AD_SLOTS`, `MONETIZATION_EVENTS`, `isAdsEnabled()`, and `isMonetizationReady()`.

- [ ] **Step 1: Add the focused failing test**
  - Assert ads are disabled when `NEXT_PUBLIC_BOBAKS_ADS_ENABLED` is absent.
  - Assert the allowed slots are a fixed set that does not include ranking-card overlays.
  - Assert monetization event names are stable strings.
  - Assert readiness is false while provider is `none`.

- [ ] **Step 2: Verify the relevant failure**
Run: `npm test -- tests/monetization.test.ts`
Expected: module import or missing-export failures proving the policy module does not yet exist.

- [ ] **Step 3: Implement the minimum behavior**
  - Define provider `none` as the current production state.
  - Parse only the explicit public ads flag, treating all other values as disabled.
  - Define only non-overlay placements: `content-top`, `content-mid`, and `footer`.
  - Define event names for `ad_impression`, `ad_click`, `sponsor_impression`, and `sponsor_click`.
  - Return false from readiness until both ads are enabled and a non-`none` provider is configured.

- [ ] **Step 4: Verify the focused pass**
Run: `npm test -- tests/monetization.test.ts`
Expected: all monetization tests pass.

- [ ] **Step 5: Run the affected integration check**
Run: `npm test`
Expected: existing and new unit tests pass.

- [ ] **Step 6: Commit the passing deliverable**
```bash
git add src/lib/monetization.ts tests/monetization.test.ts
git commit -m "feat: add monetization policy foundation"
```

### Task 2: Safe ad-slot boundary

**Files:**
- Create: `src/components/ad-slot.tsx`
- Modify: `src/components/site-shell.tsx`
- Create: `tests/ad-slot.test.ts`

**Interfaces:**
- Consumes `AdSlotProps = { slot: AdSlotId; label?: string }`.
- Produces an `AdSlot` component that is empty when monetization is inactive and has a future-provider boundary when active.

- [ ] **Step 1: Add the focused failing test**
  - Assert `AdSlot` is structurally safe to mount for every approved slot.
  - Assert the component returns null while ads are disabled.
  - Assert no ranking overlay slot exists in the exported slot policy.

- [ ] **Step 2: Verify the relevant failure**
Run: `npm test -- tests/ad-slot.test.ts`
Expected: missing component/module failure before implementation.

- [ ] **Step 3: Implement the minimum behavior**
  - Keep the component client-safe and side-effect free.
  - Return null unless monetization readiness is true.
  - Keep the component generic so a later provider can be inserted without touching ranking components.
  - Mount a single `content-top` boundary in `SiteShell` immediately before page content.
  - Do not reserve height, inject scripts, or display a placeholder while disabled.

- [ ] **Step 4: Verify the focused pass**
Run: `npm test -- tests/ad-slot.test.ts`
Expected: all ad-slot tests pass.

- [ ] **Step 5: Run the affected integration check**
Run: `npm test` and `npm run build`
Expected: all tests pass and the Next.js production build exits 0.

- [ ] **Step 6: Commit the passing deliverable**
```bash
git add src/components/ad-slot.tsx src/components/site-shell.tsx tests/ad-slot.test.ts
git commit -m "feat: add safe monetization slot boundary"
```

### Task 3: Document activation boundary and financial baseline

**Files:**
- Create: `docs/phase-7-1-monetization-foundation.md`
- Modify: `README.md` only when an existing monetization section is present; otherwise no README change.

**Interfaces:**
- Documents current disabled state, approved placements, activation prerequisites, free-core rules, and operating-cost inputs.

- [ ] **Step 1: Add the focused failing test**
  - No code test required for documentation-only content; verify the document includes the required policy terms.

- [ ] **Step 2: Verify the relevant failure**
Run: `git diff --check`
Expected: clean whitespace after the document is added.

- [ ] **Step 3: Implement the minimum behavior**
  - Record that provider selection, privacy/consent review, cost baseline, and revenue instrumentation are prerequisites before activation.
  - Record that Bobaks core ranking functionality remains free.
  - Record financial baseline inputs for Supabase, Cloudflare, R2, domain, and other recurring services without inventing current dollar amounts.

- [ ] **Step 4: Verify the focused pass**
Run: `git diff --check`
Expected: no whitespace errors.

- [ ] **Step 5: Run the affected integration check**
Run: `npm test` and `npm run build`
Expected: unit suite and production build pass.

- [ ] **Step 6: Commit the passing deliverable**
```bash
git add docs/phase-7-1-monetization-foundation.md
git commit -m "docs: define phase 7.1 monetization activation boundary"
```
