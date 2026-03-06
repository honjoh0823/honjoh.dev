# ⌨️ Yamato Layout (大和配列)

**The keyboard layout optimized for Japanese input.**

Yamato Layout is a keyboard layout that fundamentally rethinks key placement for Japanese romaji input. It places all consonants on the left hand, all vowels on the right, and arranges consonants in Japanese syllabary (50-on) order — making it both efficient and easy to learn.

> **No special hardware required.** Works on any standard QWERTY keyboard via software remapping.

🌐 **Website:** [honjoh.dev/yamato](https://honjoh.dev/yamato)
📖 **Full Reference:** [English](https://honjoh.dev/yamato/about/en) / [日本語](https://honjoh.dev/yamato/about)
📝 **Article (Japanese):** [note.com](https://note.com/_honjoh/n/n6eca0fda500b)

---

## Why?

QWERTY was designed in the 1870s to prevent typewriter jams. 150 years later, we're still using it — even though it's terrible for Japanese:

| Problem | Detail |
|---------|--------|
| **Scattered vowels** | Japanese romaji always includes a vowel, but QWERTY scatters A, I, U, E, O across the keyboard |
| **Wasted home keys** | QWERTY's F and J are among the **least-used** characters in Japanese |
| **Excessive finger travel** | Constant reaching from home position causes fatigue |

## Layout

```
┌─────────────────────────┬─────────────────────────────┐
│  Left hand (Consonants) │  Right hand (Vowels+Other)  │
├─────────────────────────┼─────────────────────────────┤
│  M    Y    R    W    P  │  X    L    Q    C    '  [  ] │
│  K    S    T   [N]   H  │  F   [A]   O    I    E   /  │
│  Z    D    B    G    J  │  V    U    -    ,    .       │
└─────────────────────────┴─────────────────────────────┘
[N] [A] = Home position (index fingers)
```

**Left = Consonants** | **Right = Vowels + low-frequency keys**

## Key Features

### 1. Consonants Left, Vowels Right
Japanese romaji is "consonant → vowel" repetition (e.g., "ka" = K → A). Yamato creates a natural left-right alternating rhythm that matches this structure. Also effective for English.

### 2. Consonants in 50-on Syllabary Order
Home row: **K**(ka) **S**(sa) **T**(ta) **N**(na) **H**(ha)
Top row: **M**(ma) **Y**(ya) **R**(ra) **W**(wa)

You don't memorize — you *recall*. The name "Yamato" (大和, the ancient name for Japan) comes from this: the sounds of the Japanese language are literally arranged on the keyboard.

### 3. Voiced Consonants on Bottom Row
All voiced consonants separated to bottom row: **Z D B G J** (+ P)
Mnemonic: **Z**un**d**a **B**ur**g**er = Z, D, B, G, **J**

### 4. High-Frequency Keys on Home Position
The most-used Japanese characters (A, K, O, I, N, U, T) are all on the home row.

### 5. Multilingual
The consonant-vowel separation benefits English, Chinese (Pinyin), and Korean input as well.

## Benchmark

Typing "日本語入力に最適化された配列" in romaji (41 keystrokes):

| Layout | Home Row Usage | Finger Movements | Optimized For |
|--------|---------------|-------------------|---------------|
| **Yamato** | **~76%** | **17** | Japanese, English, Chinese, Korean |
| QWERTY | ~34% | 28 | None (historical) |
| Ōnishi (大西配列) | ~73% | ~18 | Japanese |
| Dvorak | ~50% | ~23 | English |
| Colemak | ~48% | ~24 | English |

**Yamato vs QWERTY:** 2.2× home row usage, ~40% fewer finger movements.

## Installation

### Windows (AutoHotkey)

1. Install [AutoHotkey](https://www.autohotkey.com/)
2. Download [`Layout.ahk`](https://honjoh.dev/works/yamato/Layout.ahk)
3. Double-click to run
4. To disable: right-click AutoHotkey icon in system tray → Exit

### Mac (Karabiner-Elements)

1. Install [Karabiner-Elements](https://karabiner-elements.pqrs.org/)
2. Download [`yamato-layout.json`](https://honjoh.dev/works/yamato/yamato-layout.json)
3. Place in `~/.config/karabiner/assets/complex_modifications/`
4. Karabiner-Elements → Complex Modifications → Add rule → Enable

> You can switch back to QWERTY at any time by disabling the software. No hardware changes are made.

## FAQ

**Q: Will I forget QWERTY?**
No. Just as learning a second language doesn't erase your first, learning Yamato doesn't erase QWERTY muscle memory.

**Q: Do I need a special keyboard?**
No. Any standard QWERTY keyboard works. Software remaps the keys — no custom keycaps or hardware needed.

**Q: Is it good for programming?**
Yes. Symbol keys remain accessible, and the consonant-vowel separation doesn't interfere with coding.

**Q: How does it compare to Dvorak/Colemak?**
Dvorak and Colemak are optimized for English, not Japanese. They don't address the consonant-vowel alternation of Japanese romaji. Yamato significantly outperforms both for Japanese input.

**Q: How does it compare to Ōnishi Layout (大西配列)?**
Similar design philosophy and comparable performance. Yamato's unique advantages: (1) consonants in syllabary order for easier memorization, (2) complete voiced consonant separation, (3) multilingual optimization.

---

## 日本語

大和配列は、日本語ローマ字入力に最適化されたキーボード配列です。

- **左手に子音、右手に母音** — ローマ字入力の「子音→母音」リズムに一致
- **子音は50音順** — K(か) S(さ) T(た) N(な) H(は) M(ま) Y(や) R(ら) W(わ)
- **濁音は全て下段** — Z D B G J（ずんだバーガー）
- **特別なキーボード不要** — ソフトウェアだけで導入可能
- **ホーム列使用率 76%** — QWERTYの2.2倍

詳細: [honjoh.dev/yamato/about](https://honjoh.dev/yamato/about)

---

## License

MIT

## Author

**Nobuhiro Honjoh (本城靖大)**
- Website: [honjoh.dev](https://honjoh.dev)
- GitHub: [@honjoh0823](https://github.com/honjoh0823)
