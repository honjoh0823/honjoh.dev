# AI Contact Page - OpenClaw Integration

## Phase 1: 基盤構築（今回のスコープ）

- [x] contactページUI（チャット画面、ターミナルテーマ統一）
- [x] Cloudflare Tunnel設定（OpenClaw Gatewayの安全公開）
  - [x] WSL2にchat-proxy移設
  - [x] cloudflaredインストール・認証
  - [x] トンネル作成（api.honjoh.dev → localhost:3001）
  - [x] systemdサービス化（cloudflared + honjoh-proxy）
- [x] Cloudflare Workers（APIプロキシ + レート制限 + ログ保存）→ WSL2 chat-proxyで実現
- [x] OpenClaw公開用エージェントの設定（スキル制限、ペルソナ設定）
- [x] フロントエンドAPI_URL本番切り替え
- [x] 会話ログ（WSL2ファイルログ、D1はPhase 2へ）
- [/] 動作検証

## Phase 2: 拡張（将来）

- [ ] D1連携（Workers経由）
- [ ] ナレッジベース拡充
- [ ] 企業サイト統合
- [ ] アポ予約等のスキル追加
