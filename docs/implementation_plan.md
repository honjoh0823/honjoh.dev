# 下層ページ — Design 20 breadcrumb 実装 + リファクタリング

## 概要
承認済みモックアップ（B3: ヘッダー直下に `honjoh.dev > works` をdim色で表示）を実装。
同時に、下層ページのレイアウトをトップページと同じ Design 20 テイストに統一する。

## 変更方針

### 削除するもの（装飾の排除）
- `TerminalLayout.astro` — scanline, vignette（`::after`）を削除
- `Header.astro` — 現在の背景色・border-bottom・矢印アイコン付きヘッダーを廃止
- `global.css` — `.terminal`, `.scanline`, `.terminal::after` の装飾CSS削除

### 作るもの
- **`Header.astro` を書き換え** — トップと同じ `HONJOH.DEV` + `Honjoh Nobuhiro` ヘッダー + breadcrumb行
  - breadcrumb: `honjoh.dev > {path}` （dim色テキストのみ）
  - ヘッダー直下に1行

### レイアウト統一
- `TerminalLayout.astro` を簡素化 — scanline div 削除、ambient glow追加
- 下層ページの padding/spacing をトップページと揃える（`3rem 4rem`）
- `.terminal-body` の center寄せ → 左寄せ（トップと同じ配置）

### 各ページへの影響
- `works/index.astro` — Header props そのまま、見た目が変わる
- `article/index.astro` — 同上
- `article/[slug].astro` — 同上
- `setting/index.astro` — 同上
- `chat/index.astro` — 同上

## 検証
- localhost でトップページと下層ページを行き来し、デザインの一貫性を目視確認
- breadcrumb のパス表示が各ページで正しいことを確認
