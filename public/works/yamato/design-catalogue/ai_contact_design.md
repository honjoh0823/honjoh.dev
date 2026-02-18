# AI Contact Page - Architecture Design Discussion

## Vision

- NOT a generic AI chatbot (the world is already full of those)
- A "knowledgeable AI representative" — the user's digital clone
- Pre-loaded with curated information, released contextually
- Conversation logging for business review
- Differentiator: "one step ahead" — showcasing what AI can do for business

## Requirements

1. **Knowledge-grounded responses**: AI answers based on pre-curated information (services, portfolio, philosophy, etc.)
2. **Conversation logging**: Owner can review all visitor conversations later
3. **Security**: Must NOT expose PC internals, private data, or system-level access
4. **Differentiation**: Must feel different from ChatGPT/Gemini — personalized, contextual
5. **Business integration**: Both honjoh.dev (personal) and corporate site

## Security Analysis

### Core Risk
OpenClaw is an AI **agent** with system-level access (files, commands, web, messaging channels).
Exposing to public = prompt injection attack surface.

### Key Insight
The requirement is a "knowledgeable representative", NOT a "system agent".
The agent capabilities (file access, command execution) are the dangerous part AND unnecessary for this use case.

## Architecture Options

### Option 1: LLM API + RAG (Recommended for safety)
```
Visitor → Astro Page → Cloudflare Workers → Gemini API
                              ↓
                    Knowledge docs (embeddings / system prompt)
                    Conversation log (D1/KV)
```
- **Pro**: Physically impossible to access PC. Simple. Cheap.
- **Con**: No "agent" capabilities. Just a knowledgeable chatbot.

### Option 2: Dedicated OpenClaw Agent (sandboxed)
```
Visitor → Astro Page → Cloudflare Tunnel → OpenClaw Gateway
                                              ↓
                                    Dedicated agent (skills=0, tools=0)
                                    Knowledge via agent persona only
```
- **Pro**: Uses OpenClaw ecosystem. Could expand capabilities later.
- **Con**: Attack surface still exists (LLM can be jailbroken). Requires always-on server.

### Option 3: Separate Server + OpenClaw (isolated)
```
Visitor → Astro Page → Dedicated Server → OpenClaw (isolated instance)
                                              ↓
                                    No access to main PC at all
                                    Own knowledge base only
```
- **Pro**: Complete isolation from main PC. Can safely use agent features.
- **Con**: Additional hardware cost. More maintenance.

### Option 4: Hybrid — LLM for chat + OpenClaw for owner notifications
```
Visitor → Astro Page → Cloudflare Workers → Gemini API (safe chat)
                              ↓
                    Log saved → notify owner via OpenClaw/Telegram
```
- **Pro**: Best of both worlds. Safe public chat + OpenClaw integration for owner-side.
- **Con**: Two systems to maintain.

## Open Questions

- [x] Which option to pursue? → **Option 2 (OpenClaw dedicated agent)** chosen
- [ ] Dedicated server vs same PC with isolation? → Start with same PC (WSL2), evaluate later
- [ ] What information should the AI "know"? (services, pricing, portfolio, philosophy?)
- [ ] Should visitors be able to ask anything, or guided conversation?
- [ ] Corporate site: same system or separate instance?

## Decision Log

- 2026-02-15: Initial discussion. Identified that OpenClaw direct exposure is risky.
- 2026-02-15: User clarified vision — not generic chatbot, but knowledgeable representative.
- 2026-02-15: After weighing pros/cons, decided on OpenClaw integration with security-by-design.
- 2026-02-15: Key insight — the "agent" nature IS the differentiator. Generic LLM API = commodity.
- 2026-02-15: Security approach: dedicated agent (skills=0), Cloudflare Tunnel, Workers proxy, rate limiting.
- 2026-02-15: Workspace: D:\honjoh.dev (main, 80%) + D:\openclaw (agent config, 20%).
