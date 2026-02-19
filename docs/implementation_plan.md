# 多言語打鍵パス比較スライドの追加

## 概要
日本語(#13)の後に、英語・中国語・韓国語の打鍵パス比較スライドを追加する。

## 設計方針

### TypingCompareモジュールのリファクタ
- 現在: 1つのWORD/QF/YFがハードコード → **言語設定を外部から注入可能に**
- `TypingCompare.configure({ word, qf, yf, stats })` メソッド追加
- B.jsのSLIDES配列で言語別の設定を指定

### 作業順序（1言語ずつ）
1. **英語** `english input is nice too` — 最もシンプル（ローマ字変換なし）
2. **中国語** `zhong wen da zi ye hen qing song` — Pinyinベースで英語と同構造
3. **韓国語** `han gug eo ip ryeok do teok teok hae yo` — ローマ字入力として処理

### Phase 1: 英語のdebug-animation.html作成

#### [MODIFY] [typing-compare.js](file:///d:/honjoh.dev/public/works/yamato/typing-compare.js)
- `configure(config)` メソッド追加（WORD, QF, YF, stats, labelを動的に設定可能に）
- デフォルトは現在の日本語データを維持

#### [MODIFY] [debug-animation.html](file:///d:/honjoh.dev/public/works/yamato/debug-animation.html)
- 英語用のWORD/QF/YFデータで動作確認
- データ: `english input is nice too`
  - 各文字 = 1キー（e, n, g, l, i, s, h, スペースはスキップ, i, n, p, u, t, ...）
  - 単語間はスペースなし（表示上は単語ごとにグループ化）

## 英語テキストの分解

```
english input is nice too
```

単語ごとにグループ化（スペースは打鍵パスに含めない）:
- english: E, N, G, L, I, S, H
- input: I, N, P, U, T
- is: I, S
- nice: N, I, C, E
- too: T, O, O

## 検証
- `debug-animation.html` をブラウザで開き、← → キーでステップ実行
- 各キーのfinger mapping（QWERTY/Yamato）が正しいか確認
- パスの描画が正しいか確認
- ユーザーに目視確認を依頼
