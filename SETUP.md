# セットアップ手順

## 1. 依存関係インストール

```bash
npm install
```

## 2. Convexプロジェクト初期化

```bash
npx convex dev
```

初回実行時：
1. ブラウザが開いてGitHubログインを求められます
2. 「Create a new project」を選択
3. プロジェクト名: `asset-manager`
4. 自動的に `.env.local` に `NEXT_PUBLIC_CONVEX_URL` が設定されます

## 3. 開発サーバー起動（別ターミナル）

```bash
npm run dev
```

→ http://localhost:3000 でアクセス

## 4. 初回利用

1. http://localhost:3000/register でアカウント作成
2. ログイン後ダッシュボードへ
3. 「過去データをインポート」ボタンで2024/11〜2025/03のデータを自動投入
4. 以降は「月次入力」から毎月データを入力

## 5. AI月次チェック（Ollama）

```bash
# Ollamaインストール後（https://ollama.ai）
ollama pull qwen2.5:14b

# 月次チェック実行（要: .env.local にCONVEX_URLとセッショントークン設定）
npx tsx scripts/monthly-check.ts
```

## 6. Vercelデプロイ

```bash
npx vercel
```

Vercelの環境変数に `NEXT_PUBLIC_CONVEX_URL` を設定してください。

---

## 技術スタック

- Next.js 15 + TypeScript
- Tailwind CSS v4
- Convex（DB + リアルタイム更新）
- Recharts（グラフ）
- bcryptjs（パスワードハッシュ）
- Vercel（ホスティング）
