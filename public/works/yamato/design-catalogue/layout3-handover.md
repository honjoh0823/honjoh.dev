# layout3 引き継ぎメモ（2026-02-16）

このメモは、2026年2月16日時点で確認できる内容を「明日の作業開始用」に整理したもの。
今回のログとリポジトリ状態から復元しているため、会話上で未記録の細部は含まれていない可能性がある。

## 1. 今回共有された方針（要点）

### 1-1. 設計スコープ

- グローバルの honjoh.dev デザイン方針は基本的に全体へ適用。
- ただし `/works` 配下（サブページ含む）は例外で、作品ごとに最適な見た目を採用してよい。

参照: `AGENTS.md`

### 1-2. layout3に向けた方向性（旧検討時の記録）

以下はレビュー記録に残っている方針。

- 「作り込み前の雰囲気確認」を優先する。
- キーボードはグリッドではなく、段差つき実配列にする。
- 全体はシンプルに保つ。
- クエストは最終的に10程度を想定。
- A/B/C切替UIは目立たせず、ショートカット中心にする。
- 学習効率とゲーム体験を優先し、計測表示は主役にしない。
- 音のイメージは「静かで心地よいコトコト」。

補足: 元の `layout2` フィードバック文書は、現在は削除済み。

## 2. 現状の実装スナップショット

### 2-1. layout3 本体

- `src/pages/works/layout3.astro`
  - `Layout`ベースの独立ビジュアル。
  - 4種類のプロンプト表示（Focus / Rail / Stack / Beat）を実装。
  - 大和配列キー表示、左右手の色分け、次キー誘導、hit/miss反応あり。
  - ステージチップ、最小統計（正打/ミス）あり。
  - 1〜4キーでプロンプト表示切替。

### 2-2. layout3 関連の静的検証ファイル

- `public/works/layout3/`
  - `example1.html`〜`example17.html` 等の検証用HTML群。
  - `examples.html` あり。

### 2-3. layout3 への導線

- `src/pages/layout3.astro`
  - `/layout3` にアクセスすると `/works/layout3` へ `window.location.replace` でリダイレクト。

### 2-4. 既存ページ（layout3以外）も継続して存在

- `src/pages/layout/index.astro`
  - 既存の「大和配列 練習場」本体（別実装）が残っている。
- `src/pages/works/index.astro`
  - 先頭導線 `yamato-layout` の `href` は現状 `/layout`（`/works/layout3` ではない）。

## 3. 質問への回答: 「全て layout3 のフォルダ内に整理されているか？」

結論: **まだ完全には整理されていない**。

理由:

- `layout3` 本体は `src/pages/works/layout3.astro` にあるが、関連導線は `src/pages/layout3.astro` にも存在。
- 実運用に近い既存実装が `src/pages/layout/index.astro` に残っている。
- `/works` 一覧のリンク先がまだ `/layout` で、`/works/layout3` に統一されていない。
- 検証用HTMLは `public/works/layout3/` にまとまっているが、これは `src/pages/works/layout3.astro` とは別系統の資産。

## 4. 明日最初に決めると進めやすい事項

1. 正式ルートをどれにするか  
   候補: `/works/layout3` を正、`/layout` は互換リダイレクトにする等。
2. `works` 一覧の遷移先を統一するか  
   `src/pages/works/index.astro` の `href` を `/works/layout3` へ変更するか。
3. `layout` の扱い  
   退避、互換リダイレクト化、統合のどれにするか。
4. `public/works/layout3` のサンプルHTML群の扱い  
   保守対象にするか、参考アーカイブにするか。

## 5. 参照ファイル一覧

- `AGENTS.md`
- `src/pages/works/layout3.astro`
- `src/pages/layout3.astro`
- `src/pages/works/index.astro`
- `src/pages/layout/index.astro`
- `public/works/layout3/example1.html`（ほか同階層サンプル）
