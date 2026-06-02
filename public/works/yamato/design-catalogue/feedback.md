# Prototype Feedback Log

Detailed feedback from the site owner on each design prototype.
Other AIs: **Read this before creating a new prototype.** Understanding WHY things were rejected is more important than knowing WHAT was rejected.

---

## concept.html — ★ CURRENT BEST (Gemini 3 Pro)

**Verdict: APPROVED**

> "Monochrome is fine for now — color can be added later. The chat area at the bottom is incredible. The concept of 'being able to chat anytime' is brilliant."

**What works:**
- Single viewport, no scroll
- Monochrome simplicity
- The bottom prompt line implies "you can always talk to the system"
- Menu items are immediately understandable
- Keyboard navigation (j/k, numbers)

---

## 1.html — STANDARD (Gemini 3 Pro)

**Verdict: REJECTED — Too Busy**

> "Stylish, but the initial information volume is too high. More than what a person can grasp in a single glance. The fixed menu on the left is interesting, but unnecessary — it creates information overload."

**Lesson:** First impression must be instantly parseable. No sidebars.

---

## 2.html — RANGER (Gemini 3 Pro)

**Verdict: REJECTED — Too Complex**

> "`../` and `home` — even a grandpa must be able to understand the interface. A 3-column structure is absolutely out of the question."

**Lesson:** No filesystem jargon. No multi-column layouts. Ever.

---

## 3.html — SPOTLIGHT (Gemini 3 Pro)

**Verdict: REJECTED — Unfriendly**

> "The design taste is just too unfriendly."

**Lesson:** Command palette in isolation lacks warmth and context.

---

## 4.html — CONCEPT V2 (Gemini 3 Pro)

**Verdict: REJECTED — Boring**

> "A bit boring. No innovation."

**Lesson:** Playing it safe is worse than being bold. "Safe refinement" of a good concept can kill its soul.

---

## 5.html — STREAM (Gemini 3 Pro)

**Verdict: REJECTED — Scroll Hell**

> "This reminded me that scroll on the top page is the worst."

**Lesson:** Infinite scroll / REPL log style is fundamentally incompatible with the vision. The viewport is a fixed canvas.

---

## 6.html — HUD (Gemini 3 Pro)

**Verdict: REJECTED — Designer Ego**

> "The worst so far. Feels like designer self-satisfaction."

**Lesson:** Bento grids, dashboards, and stat displays are meaningless decoration. They serve the designer, not the user.

---

## 7.html — KINETIC (Gemini 3 Pro)

**Verdict: REJECTED — Not CLI**

> "Even worse. This is not what I asked for. I wanted ideas WITHIN the CLI aesthetic. The brilliance of concept.html's 'chat from the start' — THAT was a great idea."

**Lesson:** Innovation must happen **inside** the CLI paradigm. Breaking out of it (huge typography, poster layouts) is a fundamental misunderstanding of the project.

---

## 8.html — CHAT-OS (Gemini 3 Pro)

**Verdict: UNDER REVIEW**

Extension of concept.html where the preview pane becomes an "AI response log" and the footer input is a real interactive field. The owner acknowledged the direction with interest but has not given final feedback.

---

## 9.html — SHELL POWER (Gemini 3 Pro)

**Verdict: REJECTED — Over-Engineered**

> "No, this is wrong."

**Lesson:** Shell concepts (piping, arguments) are interesting in theory but the implementation felt too technical and lost the elegant simplicity of concept.html.

---

## 22/23/24 Follow-up Feedback — February 16, 2026

**Owner comments:**
- `23.html` is not acceptable.
- Horizontal scrolling feel is not acceptable.
- `22.html` is strongly preferred.
- `24.html` is close to `22.html` in essence.
- The bottom horizontal separator line above the prompt feels like a required element.

**Working interpretation for next prototypes:**
1. Keep the `22.html` structure as the base pattern.
2. Preserve a clear footer prompt boundary (`border-top` style separator).
3. Avoid layouts that can imply horizontal drift or timeline-like horizontal reading.
4. Explore variation through interaction and tone, not through structural complexity.

---

## Summary for Next AI

The owner wants:
1. **Concept.html's soul** — simple, monochrome, single viewport, chat-ready
2. **Innovation WITHIN CLI constraints** — not breaking out of them
3. **Grandpa-friendly** — no jargon, no complexity
4. **"Speed is Love"** — instant response, no artificial delays
5. **Chat as a first-class citizen** — the input bar is not decoration, it's the core feature
