

## Fujin File Map

When modifying Fujin drill code, use this map to identify the correct file:

### `public/works/fujin/` — File Responsibilities

| File | Lines | When to edit |
|------|-------|-------------|
| `fujin-engine.js` | 517 | Input state machine, KEY_MAP (single source of truth for all key mappings) |
| `fujin-kb.js` | 349 | KB rendering, heatmap, drill overlays (data-driven from fujin-rules.json) |
| `fujin-drill.js` | 302 | Drill logic: problem matching, input buffer, error/rewind |
| `fujin.js` | ~430 | Main app: audio, callbacks, navigation, key input handler |
| `fujin.css` | ~900 | All styles including drill animations (.tg-error, .tg-shake) |
| `fujin-slides.json` | 82 | Slide/FAQ text content and overlay configs |
| `fujin-rules.json` | 81 | Display-only rules: heatmap codes, animations, mutual exclusion |
| `fujin_typing_hints.json` | 262 | Phoneme definitions: kana, romaji, key sequences |
| `fujin-check.cjs` | 139 | Self-check: `node public/works/fujin/fujin-check.cjs` |
| `lu1.ahk` | 508 | Reference AHK script (Fujin keyboard layout source) |
| `fujin.html` | 145 | Page markup |

### Data Flow (Single Source of Truth)

```
FujinEngine.KEY_MAP (authoritative key definitions)
    ↓ derives at runtime
FujinKB._buildDisplayMaps() → fujinMap, spaceVowelMap, capsMap, consVowelLabels
    ↓ reads display config
fujin-rules.json → heatmap codes, highlight levels, error/hint animation
    ↓ reads phoneme data
fujin_typing_hints.json → drill problems (via FujinDrill.init)
```

### Common Edit Scenarios

- **Add new phoneme/drill**: edit `fujin_typing_hints.json` only
- **Change heatmap color/level**: edit `fujin-rules.json` only
- **Change key mapping**: edit `fujin-engine.js` KEY_MAP only (auto-propagates)
- **Change error animation**: edit `fujin.css` (.tg-error) + `fujin-rules.json` (duration)
- **Change slide content**: edit `fujin-slides.json` only
- **Fix drill input matching**: edit `fujin-drill.js` (_handleEngineOutput)
- **Fix KB label display**: edit `fujin-kb.js` (renderFujinKB)

