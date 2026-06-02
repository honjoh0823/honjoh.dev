# honjoh.dev — Project Guide

Personal site of Honjoh Nobuhiro. A terminal/CLI-inspired site built with Astro
and deployed to Cloudflare Pages. Keyboard-first navigation, minimal UI.

## Tech stack

- **Astro 5** (static output) — `astro.config.mjs`
- **Cloudflare Pages** — hosting (`wrangler.toml`, project `honjoh-dev`)
- **Node 22** — runtime
- Vanilla TS/JS in `<script>` blocks; CSS in `src/styles/` (no UI framework)

## Quick start

```sh
npm install
npm run dev        # http://localhost:4321
```

## Commands

| Command           | Action                                              |
| :---------------- | :-------------------------------------------------- |
| `npm run dev`     | Local dev server at `localhost:4321`                |
| `npm run build`   | Build to `./dist/`                                  |
| `npm run preview` | Preview the built site locally                      |
| `npm run deploy`  | Build **and** deploy to Cloudflare Pages (one shot) |

## Deploy

```sh
npm run deploy
```

This runs `astro build` then
`wrangler pages deploy dist --project-name=honjoh-dev --commit-dirty=true --branch=master`,
publishing to https://honjoh.dev/.

**Only deploy when explicitly asked** (see [`.agent/workflows/deploy.md`](.agent/workflows/deploy.md)).

If you hit `Authentication error [code: 10000]` / `403`, the wrangler OAuth token
has expired. Re-authenticate once, then deploy again:

```sh
npx wrangler login   # click "Allow" in the browser
npm run deploy
```

## Directory structure

```
src/
  pages/        Routes (index, article/, chat/, works/, setting/, yamato/, fujin.astro, ...)
  layouts/      TerminalLayout and shared page shells
  components/    Header, SiteFooter, HintBar, ChatInline, ...
  content/      Astro content collections (article/)
  styles/       Global + per-component CSS
  lib/          Shared helpers
  server/       chat-proxy.mjs (local-only chat backend)
public/
  works/        Self-contained sub-apps: fujin (typing drill), unzoom (geo quiz), yamato (keyboard)
docs/           Planning & design docs — see docs/README.md
.agent/         Workflows (deploy, dev-server, start) and rules
```

## Branch workflow

- **`master` is the canonical, deployable branch.** Work here or in short-lived
  feature branches merged back into `master`.
- The deploy command always publishes with `--branch=master`, independent of the
  git branch you happen to be on, so keep `master` current.
- `backup-before-design-2026-02-16` is a frozen pre-redesign snapshot — do not
  build on it.

## Design Scope Rule

- The global honjoh.dev design concept applies to the main site by default.
- Exception: pages under `/works` (including work-specific subpages) may ignore the
  global design concept.
- For `/works` pages, use the best-fit visual concept for each work even if it
  differs from honjoh.dev main styling.

## More docs

- [`docs/README.md`](docs/README.md) — index of planning/design docs
- [`.agent/workflows/`](.agent/workflows/) — start, dev-server, deploy
- [`.agent/rules/`](.agent/rules/) — design source of truth, fujin rules
