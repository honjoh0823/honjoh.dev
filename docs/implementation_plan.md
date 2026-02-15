# AIチャット本番デプロイ

## 前提（調査結果）

- OpenClaw GatewayはWebSocket通信 → REST APIなし
- Cloudflare Workers/Pages FunctionsからCLIは呼べない
- **最も現実的**: chat-proxyをWSL2上で直接動かし、Cloudflare Tunnelで公開

## アーキテクチャ

```
ブラウザ → honjoh.dev/chat → api.honjoh.dev/api/chat
                                  ↓ (Cloudflare Tunnel)
                              WSL2: chat-proxy (port 3001)
                                  ↓ (OpenClaw CLI)
                              OpenClaw Gateway (port 18789)
```

## 変更内容

### 1. WSL2にchat-proxyを移設

#### [NEW] `~/openclaw/chat-proxy.mjs`（WSL2上）
- 現在の `src/server/chat-proxy.mjs` をWSL2用にリライト
- `wsl -e bash -c "openclaw ..."` → 直接 `openclaw agent ...` 呼び出し
- CORS: `honjoh.dev` のみ許可
- レート制限: IP単位、1分5リクエスト
- ログ出力（JSON形式、後でD1連携可能）

### 2. Cloudflare Tunnel設定（WSL2で手動実行）

- `cloudflared` インストール
- `cloudflared login` でCloudflare認証
- トンネル作成: `api.honjoh.dev` → `localhost:3001`
- systemdサービス化（永続起動）

### 3. フロントエンド修正

#### [MODIFY] `src/pages/chat/index.astro`
- `API_URL` を環境変数切り替えに変更
  - dev: `http://localhost:3001/api/chat`
  - prod: `https://api.honjoh.dev/api/chat`

### 4. D1テーブル作成

#### [MODIFY] `wrangler.toml`
- D1データベースバインディング追加

#### [NEW] D1スキーマ
- `conversations` テーブル（session_id, role, message, timestamp, ip）
- ※Phase 1ではchat-proxy側でファイルログ、D1連携はPhase 2

> [!IMPORTANT]
> D1への書き込みはCloudflare Workers/Pages Functions内からのみ可能。
> chat-proxyはWSL2上で動作するため、直接D1にはアクセスできない。
> Phase 1ではWSL2側でファイルログ保存、Phase 2でWorkers経由のD1連携を検討。

### 5. DNSレコード

- `api.honjoh.dev` のCNAMEレコード（Tunnel作成時に自動設定）

## 検証

### ブラウザテスト（手動）
1. `https://honjoh.dev/chat` を開く
2. メッセージを送信 → OpenClawから応答が返る
3. セッション永続性確認（同じ会話が続く）
4. WSL2のchat-proxyログにリクエストが記録される

### セキュリティテスト（手動）
1. CORSテスト: 別ドメインからのリクエストが拒否される
2. レート制限: 連続送信でブロックされる

## 実行順序

1. WSL2でchat-proxy.mjsを作成・テスト
2. cloudflaredインストール・認証・トンネル作成
3. フロントエンドAPI_URL切り替え
4. デプロイ・動作検証
