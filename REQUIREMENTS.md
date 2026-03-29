# 家計簿・資産形成管理アプリ 要件定義書

**プロジェクト名**: Asset Manager
**作成日**: 2026-03-29
**バージョン**: 1.0.0

---

## 1. プロジェクト概要

世帯全体（本人 + 配偶者Yulin）の資産を、口座・資産タイプ別に月次管理・可視化し、
PLベース（月次フロー）およびBSベース（純資産・不動産含む）で資産形成を追跡・シミュレーションするWebアプリ。

---

## 2. 技術スタック

| 項目 | 技術 |
|------|------|
| Frontend | Next.js 15 + TypeScript |
| Styling | Tailwind CSS v4 |
| Backend / DB | Convex（リアルタイムDB + Scheduled Functions） |
| 認証 | Convex Auth + bcryptjs |
| AI月次分析 | Local LLM（Ollama）連携スクリプト |
| Deployment | Vercel |
| AI補助（開発） | Claude API |

---

## 3. 入力データ構造（資産カテゴリ）

### 3.1 日本円資産

| カテゴリ | 勘定科目 | 備考 |
|----------|----------|------|
| 楽天銀行/証券 | 流動資産 | 投資信託・株式含む |
| 企業型DC積立 | 年金資産 | iDeCo相当 |
| RSU（株式報酬） | 株式資産 | 株数 × 行使割合 × 株価USD × 円レートで計算 |
| ゆうちょ（本人） | 流動資産 | |
| ゆうちょ（Yulin） | 流動資産 | 世帯合算 |
| みずほ+現金 | 流動資産 | 商品券は対象外 |

### 3.2 人民元資産（中国）

| カテゴリ | 勘定科目 | 備考 |
|----------|----------|------|
| WeChat Pay | 流動資産 | 万元単位入力 |
| Alipay | 流動資産 | 万元単位入力 |
| 工商銀行 | 流動資産 | 万元単位入力 |
| 猪猪（Yulin資産合計） | 流動資産 | 万元単位入力、世帯合算 |

### 3.3 人民元→円換算
- 月次入力時に換算レート（円/元）を手動入力
- 換算結果を円建てで資産合算に反映

### 3.4 不動産資産（②フェーズ）
| 項目 | 内容 |
|------|------|
| 物件名 | 任意入力 |
| 購入価格 | 円 |
| 月次返済額 | 円 |
| 出口回収係数 | 0〜100%（例：75% = 返済総額の75%が資産価値として残る） |
| 現在推定価値 | 自動計算 or 手動上書き |

---

## 4. 機能要件（優先順位別）

### ① 月次資産管理・可視化（MVP必須）

#### 機能一覧
- [ ] 月次資産スナップショット入力（全カテゴリ）
- [ ] 月別推移グラフ（折れ線・棒グラフ）
- [ ] 年別サマリー表示
- [ ] カテゴリ別内訳（円グラフ / スタックバー）
- [ ] 日本円 / 人民元 / 合算（世帯総資産）の切り替え表示
- [ ] 前月比・前年比の差分・増減率表示
- [ ] 目標資産額設定と進捗表示

#### 画面構成
1. **ダッシュボード** - 最新月の総資産・前月比・前年比・カテゴリ内訳
2. **月次入力フォーム** - 全口座の残高入力（人民元レート含む）
3. **推移グラフ画面** - 月別・年別の資産推移
4. **資産内訳画面** - カテゴリ別・通貨別の詳細

---

### ② BSベース資産管理（Phase 2）

- [ ] 不動産資産の登録・管理
- [ ] ローン返済額 × 出口回収係数で純資産への算入額を自動計算
- [ ] PLベース（月次フロー）とBSベース（純資産）の並列表示
- [ ] 純資産推移グラフ（BSベース）

**計算ロジック（例）**:
```
月次ローン返済額: 200,000円
出口回収係数: 75%
→ 純資産への月次積算額: 200,000 × 75% = 150,000円/月
```

---

### ③ 未来シミュレーション（Phase 3）

#### シミュレーション設定項目
| 項目 | 内容 |
|------|------|
| 期間 | 現在〜35年先（5年刻みで表示） |
| 年収成長率 | %/年（手動入力） |
| 楽天証券（投信）年利 | %/年 |
| DC積立年利 | %/年 |
| RSU成長率 | %/年 |
| 人民元資産年利 | %/年 |
| 不動産価値変動率 | %/年 |
| 月次支出 | 円/月 |

#### 3ケースシミュレーション
| ケース | 設定方法 |
|--------|----------|
| Best Case | 各係数に自動で楽観補正（+20%等） or 手動入力 |
| Base Case | 入力値そのまま |
| Worst Case | 各係数に自動で悲観補正（-20%等） or 手動入力 |

#### 出力
- 5年刻み純資産推移グラフ（3ケース重ね表示）
- 35年後の総資産予測額（Best/Base/Worst）
- FIRE達成予測年（目標資産額到達時点）

---

### ④ 未来プラン分岐シミュレーション（Phase 4）

#### プリセットプラン
| プラン名 | 追加コスト設定 |
|----------|---------------|
| 子育て（公立） | 教育費プリセット（月額・年齢別） |
| 子育て（私立） | 教育費プリセット（月額・年齢別、高額） |
| 住宅買い替え | 売却益・購入費・新規ローン設定 |
| カスタム | 任意のイベント・支出追加 |

#### 機能
- [ ] 複数プランの同時比較（最大4プラン）
- [ ] プランごとの35年推移グラフ重ね合わせ
- [ ] ベースライン（現状維持）との差分表示

---

### ⑤ マルチユーザー認証（MVPから実装）

- [ ] メールアドレス + パスワード登録・ログイン
- [ ] パスワードハッシュ化（bcryptjs）
- [ ] セッション管理（Convex Auth）
- [ ] ユーザーごとのデータ完全分離
- [ ] パスワードリセット機能
- [ ] アカウント削除機能

> **セキュリティ**: 資産情報は個人情報のため、ユーザーIDによる完全なデータ分離を実装。
> 他ユーザーのデータへのアクセスはサーバーサイドで防止。

---

## 5. AI月次チェック機能（Local LLM連携）

### 概要
毎月の資産データをローカルLLM（Ollama）に渡し、資産分析レポートを自動生成する。

### 構成
```
[Convex DB] → [Export Script (Node.js)] → [Ollama API (localhost:11434)] → [Markdown Report]
```

### 実装方針
- `scripts/monthly-check.ts` — 月次チェックスクリプト
- Convex DBから最新2ヶ月分のデータをJSON出力
- Ollamaの推奨モデル: `qwen2.5:14b` or `llama3.2:latest`
- 分析内容：
  - 前月比・前年比の増減サマリー
  - カテゴリ別の増減分析
  - 目標達成進捗
  - 気になるポイントのアラート（例：特定口座の急減など）
  - 来月に向けたアドバイス
- 出力：Markdownレポート（`reports/YYYY-MM.md`）+ アプリ内通知

### 実行方法
```bash
# 手動実行
npx tsx scripts/monthly-check.ts --month 2026-03

# 月初自動実行（cron / launchd 設定）
0 9 1 * * cd /path/to/asset-manager && npx tsx scripts/monthly-check.ts
```

### 前提条件
- Ollamaがローカルにインストール済み
- 対象モデルがpull済み（`ollama pull qwen2.5:14b`）

---

## 6. データモデル（Convex）

```typescript
// users テーブル
{
  email: string,
  hashedPassword: string,
  displayName: string,
  createdAt: number,
}

// assetSnapshots テーブル（月次スナップショット）
{
  userId: Id<"users">,
  yearMonth: string,           // "2026-03"
  // 日本円資産（万円単位）
  rakuten: number,             // 楽天銀行/証券
  corporateDC: number,         // 企業型DC積立
  rsu: number,                 // RSU（計算後円建て）
  rsuDetails: {                // RSU計算用内訳
    shares: number,
    vestingRate: number,       // 行使割合（%）
    stockPriceUSD: number,
    usdJpyRate: number,
  },
  yuchoBenri: number,          // ゆうちょ（本人）
  yuchoYulin: number,          // ゆうちょ（Yulin）
  mizuhoCash: number,          // みずほ+現金
  // 人民元資産（万元単位）
  wechat: number,
  alipay: number,
  icbc: number,                // 工商銀行
  yulinTotal: number,          // 猪猪合計
  cnyJpyRate: number,          // 人民元→円換算レート
  // 計算値（自動）
  totalJPY: number,            // 日本円合計
  totalCNYinJPY: number,       // 人民元→円換算合計
  grandTotal: number,          // 世帯総資産（円）
  memo: string,                // メモ（任意）
  createdAt: number,
}

// realEstateAssets テーブル（不動産、Phase 2）
{
  userId: Id<"users">,
  name: string,
  purchasePrice: number,
  monthlyPayment: number,
  exitRecoveryRate: number,    // 出口回収係数（0〜1）
  purchaseDate: string,
  isActive: boolean,
}

// simulationSettings テーブル（Phase 3）
{
  userId: Id<"users">,
  annualIncomeGrowth: number,
  rakutenAnnualReturn: number,
  dcAnnualReturn: number,
  rsuGrowthRate: number,
  cnyAnnualReturn: number,
  realEstateAppreciation: number,
  monthlyExpense: number,
  targetAsset: number,
  bestCaseMultiplier: number,   // デフォルト: 1.2
  worstCaseMultiplier: number,  // デフォルト: 0.8
}

// futurePlans テーブル（Phase 4）
{
  userId: Id<"users">,
  planName: string,
  planType: "childcare_public" | "childcare_private" | "house_change" | "custom",
  events: Array<{
    year: number,
    monthlyExpenseChange: number,
    oneTimeExpense: number,
    description: string,
  }>,
}
```

---

## 7. 将来要件（バックログ）

- [ ] RSU自動株価取得（Yahoo Finance API / Alpha Vantage）
- [ ] USD/JPY、CNY/JPY 為替レート自動取得
- [ ] 楽天証券API連携（残高自動同期）
- [ ] 資産データのCSV/Excelエクスポート
- [ ] 複数通貨の自動換算ダッシュボード
- [ ] メール通知（月次レポート自動送信）
- [ ] モバイルアプリ化（React Native / Expo）

---

## 8. フェーズ別開発計画

### Phase 0 — MVP（最優先）
**含む機能**: ①月次入力・可視化 + ⑤認証

- [x] プロジェクトセットアップ（Next.js + Convex + Tailwind）
- [ ] 認証（登録・ログイン・ログアウト）
- [ ] 月次資産入力フォーム（全カテゴリ）
- [ ] ダッシュボード（総資産・前月比・カテゴリ内訳）
- [ ] 月別・年別推移グラフ
- [ ] Vercelデプロイ

### Phase 1 — BS管理
**含む機能**: ②不動産・ローン管理

- [ ] 不動産資産登録
- [ ] 出口回収係数計算
- [ ] PLベース / BSベース切り替え表示

### Phase 2 — シミュレーション
**含む機能**: ③35年シミュレーション

- [ ] シミュレーション設定画面
- [ ] 3ケース（Best/Base/Worst）計算エンジン
- [ ] 5年刻み推移グラフ
- [ ] FIRE達成予測

### Phase 3 — プラン分岐
**含む機能**: ④ライフイベント分岐

- [ ] プリセットプラン（子育て・住宅等）
- [ ] カスタムプラン作成
- [ ] 複数プラン比較グラフ

### Phase 4 — Local AI月次チェック
- [ ] `scripts/monthly-check.ts` 実装
- [ ] Ollama連携
- [ ] Markdownレポート自動生成
- [ ] アプリ内通知表示

---

## 9. 非機能要件

| 項目 | 要件 |
|------|------|
| レスポンシブ | モバイル・タブレット・PC全対応 |
| セキュリティ | HTTPS必須、ユーザーデータ完全分離、パスワードbcryptハッシュ化 |
| パフォーマンス | ダッシュボード初期表示 < 2秒 |
| 可用性 | Vercel + Convexの標準SLA準拠 |
| プライバシー | 資産データは認証済みユーザーのみアクセス可 |

---

## 10. 初期データ（移行データ）

以下の過去データをシードデータとして投入：

| 年月 | 世帯総資産（概算） | メモ |
|------|-------------------|------|
| 2024-11 | 3,800万円（+人民元550万円相当） | |
| 2024-12 | 3,900万円（+人民元540万円相当） | 史上最高値更新・前年比+650万円 |
| 2025-01 | 3,900万円（+人民元500万円相当） | 前年比+780万円 |
| 2025-02 | 3,965万円（+人民元500万円相当） | |
| 2025-03 | 4,000万円（+人民元500万円相当） | 25年1月比+800万円 |

> 注: +80万円商品券は資産に含めない

---

*このドキュメントはフェーズ進行に合わせて随時更新する*
