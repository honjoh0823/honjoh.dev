# A.html カラー整理

## 目的
- A.html 内の全カラーを CSS 変数化し、デザインカタログ作成の土台を整える

## 現状

### 変数化済み（`:root`、145行）
- サイト基本色：`--bg`, `--ink`, `--soft`, `--accent`, `--accent-dim`, `--line`
- キー状態色：`--k-n-*`, `--k-l-*`, `--k-la-*`, `--k-r-*`, `--k-ra-*`, `--k-rn-*`, `--k-q-*`, `--k-qn-*`
- ヒートマップ：`--h1~10-*`, `--hl1~10-*`, `--hr1~10-*`
- プログレスバー：`--prog-track`, `--prog-fill`

### ハードコード（CSS・JS・インライン）

| 色 | 用途 | 提案変数名 |
|---|---|---|
| `#aaa` | quest em, tagline | `--ink-mid` |
| `#444` | prog-label, tc-roma | `--ink-muted` |
| `#666` | prog-label:hover, tc-pressing border | `--ink-dim` |
| `#888` | nav-btn, nav-hint kbd | `--ink-soft` |
| `#333` | nav-btn border, nav-hint kbd border | `--border-subtle` |
| `#ddd` | tc-pressing text | `--ink-bright` |
| `#555` | tc-key text, inline style | `--ink-muted-alt`（`--k-n-tx` と同値、統合可） |
| `#1a1a1e` | nav-hint kbd bg | `--prog-track` と同値、再利用可 |
| `#2a2a2a` | tc-roma done | `--ink-ghost` |
| `#2a2a30` | tc-pressing bg | 変数化不要（tc専用、後述） |
| `#1e1e22`, `#383840` | tc-pressed | `--tc-pressed-bg`, `--tc-pressed-bd` |
| `#181610`, `#302a1c`, `#5a4e38` | tc-q pressed | `--tc-q-pressed-bg/bd/tx` |
| `#b89060` (JS) | QWERTY パスライン色 | `--tc-q-path` |
| `#6898c8` (JS) | Yamato 左手パスライン色 | `--accent`と同値、変数参照不可→変数化 |
| `#c86898` (JS) | Yamato 右手パスライン色 | `--tc-y-path-r` |
| rgba群 | ボックスシャドウ・グロー・背景 | カテゴリ別に変数化 |

## 変更方針
1. `:root` に不足している変数を追加（上表の「提案変数名」）
2. CSS ルール内のハードコードを変数参照に置換
3. JS 内のカラー定数を `:root` から `getComputedStyle` で取得、または JS 定数として上部に集約
4. rgba のうちベースカラーが既存変数と同じものは、opacity だけが異なるので変数名で管理

## 変更対象
- `A.html` のみ（`<style>` + `<script>` 内）

## 検証
- ブラウザで `#1` ～ `#13` 全スライドを目視確認（色が変わっていないこと）
- ユーザーに確認依頼
