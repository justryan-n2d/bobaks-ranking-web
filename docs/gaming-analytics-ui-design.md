# Gaming Analytics UI Design

**Date:** 2026-10-05  
**Status:** Approved and implemented on `feat/gaming-analytics-ui-20261005`

## Goal

Evolve the Bobaks gamer-facing web into a minimal Gaming Analytics interface that feels active and polished without becoming visually noisy.

## Visual direction

- Preserve the existing web foundation because its performance and overall design are strong.
- Keep the existing information architecture and route structure.
- Use semantic visual signals for live state, rank movement, peaks, and new entries.
- Use game imagery and data hierarchy as the main source of visual personality.
- Use subtle elevation, borders, hover states, and short motion to make the interface feel alive.
- Support light and dark environments through shared semantic design tokens.
- Avoid excessive neon, heavy gradients, glassmorphism, decorative gaming effects, and Roblox-style UI imitation.

## Surface rules

### Shell
The sidebar remains the primary navigation surface. Active navigation uses a restrained Bobaks accent treatment. Branding includes a small live-state marker.

### Home
The existing discovery structure remains:
hero → search → live ranking board → movement signals → trending/peak content → utility routes.

The hero receives stronger contrast and a restrained blue analytics treatment. Ranking content remains the main visual focus.

### Rankings
Ranking numbers use semantic rank pills. Top 3 receive distinct but restrained treatments. Positive and negative movement use separate signal colors.

### Game profile
The game hero uses the same Bobaks visual treatment as Home. Current players, live rank, and recorded peak receive semantic top-edge accents. History charts use the shared design tokens.

### Motion and accessibility
Motion remains short and purposeful. The reduced-motion media query disables decorative animation and transitions. Interactions retain keyboard-visible focus behavior from the existing component foundation.

## Non-goals

This pass does not change ranking calculations, API contracts, account behavior, data retention, or production backend infrastructure.
