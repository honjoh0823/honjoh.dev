# 同時押し仮名完了時の awaitingRelease 誤クリア修正

## 問題
- 同時押し仮名（か行等）完了時、`engine.reset()`が`keyDownMap`をクリア
- 物理キーがまだ押されているのに「全リリース済み」と誤判定
- 最初のkeyupで即座にawaitingReleaseがクリアされ、次のキーハイライトが出る

## 修正方針
- 仮名完了（またはエラー）時に、**その時点で物理的に押されているキーを記録**
- `checkReleaseError`で、記録したキーの**keyupイベントが全て届くまで**awaitingReleaseを維持
- `engine.reset()`によるkeyDownMapクリアに依存しない

## 変更ファイル

### [MODIFY] [fujin-drill.js](file:///d:/honjoh.dev/public/works/fujin/fujin-drill.js)
- `_awaitingKeys` (Set) を追加 — awaitRelease設定時に押されていたキーのセット
- `_handleEngineOutput`の仮名完了/エラー時に`_awaitingKeys`を設定
- `checkReleaseError`のクリア条件に`_awaitingKeys`全リリースチェックを追加

### [MODIFY] [fujin.js](file:///d:/honjoh.dev/public/works/fujin/fujin.js)
- keyup時にdrillの`_awaitingKeys`からキーを除外する処理を追加

## 検証
- ユーザーによるブラウザ手動確認
  - か行ドリル（#9）で「か」完了後、k+nが押されたまま → ハイライトなし
  - 全キーリリース後に次のヒントが表示される
