# honjoh.dev Design Prototyping Lab

## For AI: Read This First

You are creating an HTML design prototype for the personal website **honjoh.dev**.
Save your file as `{number}.html` (e.g., `10.html`, `11.html`) in this directory.
Add your **model name** somewhere visible in the HTML (footer, comment, etc.).

After creating your file, **add a link to it in `index.html`** in the "ITERATIONS" section.

---

## The Gold Standard: `concept.html`

**Open `concept.html` in this directory first.** This is the current best design.
Your prototype should explore variations, improvements, or new ideas — but always respect the constraints below.

### What makes `concept.html` great:
- Single viewport. No scrolling.
- Monochrome. Structure defined by spacing, not borders.
- Navigation via keyboard (`j`/`k`, number keys).
- A **chat/command input** at the bottom — the user can always "talk" to the site.
- Simple enough for anyone to understand at first glance.

---

## Absolute Constraints (Do NOT Violate)

| Rule | Reason |
|---|---|
| **No vertical scrolling on the top page** | "Vertical long sites are the worst." |
| **CLI-based aesthetic only** | No poster layouts, no bento grids, no dashboard HUDs. |
| **Grandpa-friendly** | If your grandpa can't understand it, it's too complex. No `../`, no `usr/var`, no jargon. |
| **No decoration libraries** | No charm.sh, no heavy CSS frameworks. Raw HTML/CSS only. |
| **Speed is love** | No artificial typing delays. Content appears instantly. |
| **Information reduction** | Show less than you think is necessary. Whitespace is luxury. |
| **Single file** | Each prototype must be a single self-contained `.html` file. |

---

## Encouraged Ideas

- **Chat integration**: The bottom input area is a live chat line, not just a command prompt. The site should feel like a "connected session."
- **Keyboard-first navigation**: `j`/`k` to move, numbers to jump, `Enter` to select.
- **Color experiments**: The base is monochrome, but tasteful color accents are welcome. Explore different palettes.
- **New interaction patterns within CLI constraints**: Think about what Shell/Bash concepts (piping, arguments, environment variables) could mean in a web context.
- **Responsive feel**: The interface should feel alive and reactive without being flashy.

---

## Rejected Patterns (Learn from these failures)

| # | Name | Why it failed |
|---|---|---|
| 1 | Standard (2-pane) | Too much information at first glance. Fixed sidebar unnecessary. |
| 2 | Ranger (3-column) | Too complex. Filesystem jargon. "Even a grandpa must understand it." |
| 3 | Spotlight | Too unfriendly. Pure command palette without context. |
| 4 | Concept v2 | "Boring. No innovation." Too safe, no personality. |
| 5 | Stream (REPL) | Vertical scroll = instant rejection. |
| 6 | HUD (Bento Grid) | "The worst. Designer ego." Not CLI. |
| 7 | Kinetic Typography | "Not what I asked for." Completely broke CLI constraints. |
| 9 | Shell Power | Over-engineered. Too technical for the aesthetic goal. |

### Key Takeaway from Failures:
> "The Web is evolving towards the CLI. I want a **stylish CLI-like** site. The innovation should happen **within** the CLI aesthetic, not by breaking out of it."

---

## Site Structure (Content for Prototypes)

The site has these sections:
- **Works** — Portfolio / Projects
- **Articles** — Blog posts / Technical logs
- **About** — Self-introduction
- **Chat** — AI-powered chat interface
- **Setting** — User preferences

---

## Technical Notes

- Font: `JetBrains Mono` (monospace)
- Dark background preferred (`#0a0a0a` to `#111111`)
- Light text (`#d4d4d4` to `#e5e5e5`)
- Selection: Reverse video (light bg, dark text)
- Framework: Site runs on Astro (but prototypes are standalone HTML)
