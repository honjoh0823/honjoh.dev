---
name: Design System
description: Design system workflow — how to add, modify, or evolve visual styles on honjoh.dev
---

# Design System Workflow

## Overview

honjoh.dev uses a prototype-first design system. The visual source of truth lives in `docs/design/` as standalone HTML prototypes. Implementation in `src/` consumes shared component CSS extracted from the prototype.

## Design Cycle

```
1. Prototype (docs/design/*.html)
   ↓  design approved
2. Extract tokens & components (src/styles/)
   ↓  CSS updated
3. Implement in pages (src/pages/)
   ↓  new feature needed
4. If balance breaks → go back to step 1
```

### When to Return to Prototype

- Adding a new UI element that doesn't fit existing components
- Changing color scheme, typography, or layout structure
- The current prototype no longer represents what's on localhost

### When NOT Needed

- Using existing components as-is (nav-menu, prompt, etc.)
- Content-only changes (new articles, text edits)
- Backend/API changes

## CSS Architecture

```
src/styles/
├── tokens.css              ← Design tokens (colors, fonts, spacing)
├── global.css              ← Reset, body, page layout shell, kbd, animations
└── components/
    ├── nav-menu.css         ← .nav-menu, .nav-item, .nav-key, .nav-label,
    │                          .nav-desc, .nav-date, .nav-preview, .nav-disabled
    ├── prompt.css           ← .prompt-area, .prompt-symbol, .prompt-input
    └── (future files)       ← Add new component CSS as patterns emerge
```

All component CSS files are imported globally via `Layout.astro`.

## Shared CSS Class Reference

### Nav Menu (`nav-menu.css`)
| Class | Purpose |
|---|---|
| `.nav-menu` | Container `<nav>` or `<ul>` for the list |
| `.nav-item` | Each selectable row (use on `<a>` or `<li>`) |
| `.nav-active` | Currently highlighted item |
| `.nav-disabled` | Greyed-out, non-interactive item |
| `.nav-key` | Number key indicator (e.g., `1`, `2`) |
| `.nav-label` | Item name |
| `.nav-desc` | Right-aligned short description |
| `.nav-date` | Right-aligned date (for articles) |
| `.nav-preview` | Description text shown below the menu |

### Prompt (`prompt.css`)
| Class | Purpose |
|---|---|
| `.prompt-area` | Container with border-top separator |
| `.prompt-symbol` | The `❯` character |
| `.prompt-input` | Text input field |

### Page Layout (`global.css`)
| Class | Purpose |
|---|---|
| `.page` | Full-viewport flex column with ambient glow |
| `.page-body` | Scrollable content area, max-width constrained |

## Layout Usage

All pages should use `TerminalLayout.astro` which provides:
- `slot="header"` — Header component
- default slot — Page body content
- `slot="footer"` — HintBar or input area

## Adding a New Component

1. Create `src/styles/components/{name}.css`
2. Add `import "../styles/components/{name}.css"` in `Layout.astro`
3. Document classes in this skill file
