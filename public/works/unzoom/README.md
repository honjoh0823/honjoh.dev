# Unzoom

ズームアウト式の地理クイズ。衛星写真の最大ズームから始まり、「引く」たびに視野が広がって、海だと思った水面が湾や湖だったと**覆っていく**。早く見抜くほど持ち点を温存できるサバイバル形式。日本版／世界版。

`/works/unzoom/unzoom.html`（サイト内導線は未接続：`src/pages/works/index.astro` の「game 準備中」枠）。ビルド不要の素の HTML + ES Modules、Astro の `public/` から静的配信。

## 走らせる

```
npm run dev   # → http://localhost:4321/works/unzoom/unzoom.html
```

JS/CSS を変えて反映されない時はハードリロード（Ctrl/Cmd+Shift+R）。CSS は `unzoom.css?v=N` でキャッシュバスト中。

## ファイル構成

```
unzoom.html       画面構造（HUD / 2ペイン / 各オーバーレイ）
unzoom.css        スタイル
js/
  main.js         エントリ（DOM ready で initGame）
  game.js         コントローラ：state・HUD・ステージ進行・キーボード・チュートリアル・シェア
  puzzle.js       左ペインの衛星クルー（createPuzzleView）
  answer-grid.js  右ペインの回答グリッド（createAnswerGrid）
  config.js       全チューニング値：スコア・タイルURL・MODES(jp/world)・judgeLabel
  util.js         $ / fmt / clamp / shuffle
  data/japan.js   日本の問題（本土の湾、海岸中心）
  data/world.js   世界の問題（海岸・水辺）
```

Leaflet は CDN のクラシックスクリプトで先読み、`window.L` をモジュールから参照（バンドラ無し）。

## 画面（統合1画面）

最初から左右2ペインの1画面。別の回答オーバーレイは無い。

- 左 **「ここはどこ？」**（`#clue-pane`）= 衛星クルー（北固定・中心に照準）。`−` で引く。
- 右 **「ここだと思う場所」**（`#map-pane`）= 地域地図＋粗いマス目。`↑↓←→`/クリックでマス選択。
- 両ペインは**等サイズの正方形**（`game.layoutPanes` = `min(全高, 横半分)`）。HUD（上）と操作ボタン（引く=左／確定=右）は**ペインにオーバーレイ**。最上部に極細の持ち点バー。

## アーキテクチャ

`game.js` が2ビューを**インターフェース越し**にのみ操作（実装差し替え可）：

- `createPuzzleView(id)` → `{ mount(q), zoomOut(), canZoomOut(), resize() }`
  - いまは Esri World Imagery のライブタイル。**本番は事前生成 webp の `BakedFramePuzzleView` に差し替え予定**（同じ形を返せばよい）。
- `createAnswerGrid(id)` → `{ reset(mode), move(dc,dr), selectedCell(), cellOf(latlng) }`
  - ベースは CARTO Voyager(nolabels)＝海:青/陸:ベージュ。`zoomSnap:0` で bounds をペインにピッタリ。`cellOf` は経度を地図中心へ正規化（太平洋中心の世界地図で米国等を正しく射影）。

## ゲーム設計

- **覆りが主役**。開始フレームは必ず**海岸線の足場**を含む（青一色は理不尽）。実装ルール: 同一 `startZoom`＋**出題中心を海岸に置く**（湾の沖中心はNG）。
- パズルは**北固定**（ランダム回転は試した上で廃止）。タイル先読み(`prefetch`)で黒フラッシュ抑制。
- **スコア＝サバイバル**：共通の持ち点 `START_POINTS`(既定50)。1ズーム `−ZOOM_COST`(1)、回答は正解セルからのチェビシェフ距離ぶん減点（ぴったり0/隣1/…）。0で終了、**スコア＝クリアしたステージ数**。問題はエンドレス（一巡で再シャッフル）。
- **粗いブロック**：日本 `gridCols=14`、世界 `=24`（認識できる地域単位）。答えの精度（ブロック粒度）とズームのコストは別レイヤーに保つ方針。
- **bounds**：日本＝本土のみ（稚内45.65N〜佐多岬31N、離島なし）。世界＝アジア(太平洋)中心 `[-58,-30]-[80,330]`。
- **結果シェア**：ゲームオーバーで Wordle 式の絵文字パターン＋スコア（`navigator.share`→無ければ X intent）。完全な改ざん防止は静的サイトでは不可（将来サーバ/デイリーシード）。

## 操作（キーボードファースト）

| 場面 | キー |
|---|---|
| スタート | `1` 日本 / `2` 世界 / `Enter` 日本 |
| プレイ中 | `−` 引く / `↑↓←→`(WASD) 右マス移動 / `Enter` 確定 / `Esc` 最初から |
| 結果・終了 | `Enter` 次へ／もう一度 |

## よくある編集

- **問題の追加/調整** → `data/japan.js` / `data/world.js`（`lat/lng/startZoom/minZoom/label/twist`、中心は海岸に）。
- **難易度バランス** → `config.js`：`START_POINTS`・`ZOOM_COST`・`MODES.*.gridCols`・`bounds`。
- **判定ラベル / 絵文字** → `config.js` の `judgeLabel` / `game.js` の `chebEmoji`。

## TODO / 未対応

- 本番化：ライブタイル → 事前生成 webp（EOX Sentinel-2 cloudless, CC BY が再配布的に有力）。
- サイト導線（works一覧 → `/unzoom`）は未接続。公開は保留中。
- 世界版の出題中心も海岸へ寄せる調整（SF=海峡中心, マレ=環礁 等が要調整）。
- 近隣国の陸地はラベル無しで残る（完全除去には日本形状マスクが必要）。
