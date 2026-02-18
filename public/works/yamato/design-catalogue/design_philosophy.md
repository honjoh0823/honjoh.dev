# honjoh.dev Design Philosophy

## CLI/Keyboard-First Web

The web should evolve toward CLI-like, keyboard-driven navigation.

### Core Ideas
- Arrow keys for page navigation (prev/next)
- Breadcrumb-style path display (`~ / layout / practice`)
- Keyboard shortcuts for all major actions
- Minimal, terminal-inspired UI aesthetic

### Why This Fits
- The site promotes Yamato Layout (a keyboard layout) — keyboard-first UX is philosophically consistent
- Reduces dependency on mouse/trackpad
- Encourages efficient, intentional interaction

## Framework Decision

**Current: Astro** — sufficient for current scale (few pages). Static generation aligns with minimalist philosophy. Keyboard nav achievable via `<script>` + View Transitions.

**Future consideration: SvelteKit** — if the site grows and needs unified keyboard navigation across many pages, SvelteKit's SPA model handles global key handlers and seamless transitions more naturally. Migration cost from Astro would be low.

**Decision: Stay with Astro for now. Re-evaluate when scale demands it.**
