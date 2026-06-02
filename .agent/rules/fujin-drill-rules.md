# Fujin Drill Rules

Self-check reference for all drill display, feedback, and input validation rules.

---

## 1. Key Highlight Hierarchy (Strict Priority)

| Layer | Condition | Heatmap | Description |
|-------|-----------|---------|-------------|
| **Next key** | The ONE key user must press next | `hl3` (cons) / `hr3` (vowel) | Bright pulse. ONLY ONE key at a time. |
| **Vowel hint** | Consonant held → vowel-capable keys | `hr2` | Subtle background. Shows ALL possible vowels. |
| **Base** | Default consonant/mod keys | `hl2` / `n` | Defined in `fujin-rules.json > baseOverlay` |

### Rule: "Next key" ALWAYS overrides "vowel hint"

When a consonant is held and multiple vowel keys show `hr2`, the **correct next key** must be `hr3` (bright), overriding the `hr2`.

**Example — "く" (ku):**
- User holds A(k) → all vowel keys get `hr2` (I, O, A, E=Space, U=Alt)
- Next key = Alt(u) → Alt gets `hr3` (bright pulse), overriding `hr2`
- Space(e) stays `hr2` (subtle, NOT bright)

**Example — "き" (ki):**
- User holds A(k) → all vowel keys get `hr2`
- Next key = S(i) → S gets `hr3`, overriding `hr2`
- F(a), D(o), Space(e), Alt(u) stay `hr2`

### Rule: Space-held suppresses consonant highlights

When Space is held, consonant keys become vowels (e.g. A→E). In this state, a consonant "next key" must NOT get `hl3`. It stays `hr2` like other vowels.

**Example — "か" (ka) with Space accidentally held:**
- A(k) normally needs `hl3` (next consonant)
- But Space is held → A now produces "e", not "k"
- A stays `hr2` (vowel hint), NOT promoted to `hl3`

### Rule: Stale-key suppression after kana completion (`awaitingRelease`)

After completing a kana, `awaitingRelease = true`. While true:
- **Engine output is IGNORED** (no chars added to buffer)
- **Overlay shows base layer only** (no consHold/nextKey highlights)
- Flag clears when ALL char keys + Space are released

This prevents browser keydown-repeat from injecting stale characters and stops misleading highlights.

**Example — after "き" (ki), A(k) still held:**
- `awaitingRelease = true` → Alt/Space stay at base overlay, NOT hr2/hr4
- User releases A → `checkReleaseError` clears flag → next kana begins

---

## 2. Error Feedback

| Aspect | Value | Notes |
|--------|-------|-------|
| **Sound** | 55Hz square wave, 0.1s | Near-lowest audible. Subtle buzz. |
| **Visual** | Shake animation only | NO red color, NO red glow. CSS `.tg-error` has no `box-shadow` or `color` override. |
| **Scope** | Shake the active kana (`.tg-k.active`) AND the next-expected keyboard key | Both elements get `tg-error` class for 350ms |

---

## 3. Input Validation — Atomic Kana Rule

> **"One kana = one atomic input. No partial credit."**

| Rule | Detail |
|------|--------|
| **Simultaneous input** | Keys for a kana (e.g. A+F for "ka") must be pressed together. |
| **Release check** | If ALL char keys are released and the input buffer is mid-kana (not at a clean kana boundary), trigger error + full reset of that kana. |
| **Wrong key** | Any engine output that doesn't match the expected romaji prefix → error + buzz + rewind to START of current kana block. |
| **Error → awaitingRelease** | After BOTH success and error, `awaitingRelease = true`. User must release all keys before retrying. Prevents rapid-fire errors from key repeat. |
| **Implementation** | `FujinDrill.checkReleaseError(state)` + `_releaseGateOpen` gate (setTimeout 0) |

**Example — "あ" (a = Space + F):**
- Space must be pressed FIRST (no output, just `spaceHeld = true`)
- Then F while Space held → engine emits 'a' → correct!
- If A is pressed first → engine emits 'k' → 'a'.startsWith('k') = false → ERROR + buzz
- After error: `awaitingRelease = true` → user must release all keys before retry

**Example — "か" (ka = A+F):**
1. User presses A → engine emits "k" → buffer = "k" (prefix of "ka", accepted temporarily)
2. User releases A without pressing F → `checkReleaseError` detects no char keys held + buffer mid-kana → ERROR → buffer reset to ""
3. `awaitingRelease = true` → user must release, then retry from scratch

---

## 4. Display Text Grid (`.tg-grid`)

| Element | Untyped | Active (next romaji) | Done |
|---------|---------|---------------------|------|
| Kana (`.tg-k`) | `--ink-muted` | `--ink-white`, bold | `opacity: .4` |
| Consonant romaji (`.tg-rc`) | — | `--accent`, bold | `opacity: .4` |
| Vowel romaji (`.tg-rv`) | — | `hsl(345 58% 55%)`, bold | `opacity: .4` |

---

## 5. Checklist — New Drill Self-Check

Before shipping any new drill, verify:

- [ ] Each kana's `keys` array in `fujin_typing_hints.json` has correct physical keys
- [ ] `getNextKeyToPress()` returns exactly ONE key at a time
- [ ] Consonant-hold shows ALL vowels as `hr2`, but ONLY the target vowel is `hr3`
- [ ] Error triggers atomic kana reset (not partial)
- [ ] Error sound is 55Hz buzz (not higher)
- [ ] Error shake has NO red color/glow
- [ ] Tab is NOT displayed on keyboard layout (blank key)
- [ ] Keys outside `CODE_TO_KEY` (e.g. Tab) trigger error+buzz during drill
- [ ] `awaitingRelease` blocks ALL key input in keydown handler (not just engine output)
- [ ] Navigation keys (arrows, Escape, F-keys) are excluded from error detection
