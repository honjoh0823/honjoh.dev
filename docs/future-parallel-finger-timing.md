# Future Task: Parallel Finger Timing Model

## Status: Planned (not urgent)

## Problem

The current `buildTimeline()` in `typing-compare.js` treats all actions as strictly **serial**.
In reality, when consecutive keystrokes use **different fingers** (especially different hands),
the movement of the next finger can **overlap** with the current keystroke.

Keyboard layout researchers may challenge this simplification.

## Example: Yamato "NIHON" (Move: 100ms, Key: 50ms)

### Current (Serial)

| # | type | char | finger | delay | cumulative |
|---|------|------|--------|-------|------------|
| 1 | key  | N    | 3 (L)  | 50ms  | 0.05s      |
| 2 | key  | I    | 6 (R)  | 50ms  | 0.10s      |
| 3 | move | →H   | 3 (L)  | 100ms | 0.20s      |
| 4 | key  | H    | 3 (L)  | 50ms  | 0.25s      |
| 5 | home | →N   | 3 (L)  | 100ms | 0.35s      |
| 6 | key  | O    | 5 (R)  | 50ms  | 0.40s      |
| 7 | key  | N    | 3 (L)  | 50ms  | 0.45s      |

**Total: 0.45s**

### Desired (Parallel)

| t      | Left hand (finger 3)  | Right hand (finger 5,6) |
|--------|-----------------------|-------------------------|
| 0.00s  | **key N** (50ms)      | —                       |
| 0.05s  | move →H (100ms)       | **key I** (50ms)        |
| 0.15s  | **key H** (50ms)      | —                       |
| 0.20s  | home →N (100ms)       | **key O** (50ms)        |
| 0.30s  | **key N** (50ms)      | —                       |

**Total: 0.35s** (22% faster)

## Implementation Notes

- Each finger needs an independent timer/state
- Dependency: a keystroke can only fire when its finger's movement is complete
- Visual: multiple fingers may animate simultaneously
- Prototype for testing: `public/works/yamato/proto-independent-timing.html`
  - Has sliders for Move/Home ms and Key ms

## Related Files

- `public/works/yamato/typing-compare.js` — `buildTimeline()`, `runSide()`
- `public/works/yamato/proto-independent-timing.html` — test prototype
