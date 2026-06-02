---
description: Build and deploy honjoh.dev to Cloudflare Pages
---

# Deploy Workflow

> **IMPORTANT**: Do NOT deploy automatically. Only deploy when the user explicitly requests it (e.g., "デプロイして", "deploy").

## Steps

// turbo
1. Build the project:
```
npm run build
```

2. Deploy to Cloudflare Pages:
```
npx wrangler pages deploy dist --project-name=honjoh-dev --commit-dirty=true --branch=master
```

## Development

- Use `npm run dev` and verify at `http://localhost:4321/`
- Do NOT deploy after code changes unless explicitly instructed
