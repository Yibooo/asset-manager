export function formatManYen(value: number): string {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}億円`;
  }
  return `${value.toLocaleString()}万円`;
}

export function formatManYuan(value: number): string {
  return `${value.toFixed(1)}万元`;
}

export function formatYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-");
  return `${year}年${parseInt(month)}月`;
}

export function getDiffLabel(diff: number): string {
  if (diff > 0) return `+${diff.toLocaleString()}万円`;
  if (diff < 0) return `${diff.toLocaleString()}万円`;
  return "±0万円";
}

export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export const ACCOUNT_LABELS: Record<string, string> = {
  rakuten: "楽天銀行/証券",
  corporateDC: "企業型DC積立",
  rsu: "RSU（株式報酬）",
  yuchoBenri: "ゆうちょ（本人）",
  yuchoYulin: "ゆうちょ（Yulin）",
  mizuhoCash: "みずほ+現金",
  wechat: "WeChat Pay",
  alipay: "Alipay",
  icbc: "工商銀行",
};

export const ACCOUNT_COLORS: Record<string, string> = {
  rakuten: "#3b82f6",
  corporateDC: "#8b5cf6",
  rsu: "#f59e0b",
  yuchoBenri: "#10b981",
  yuchoYulin: "#34d399",
  mizuhoCash: "#14b8a6",
  wechat: "#f43f5e",
  alipay: "#fb923c",
  icbc: "#e879f9",
};

export const JPY_ACCOUNTS = [
  "rakuten",
  "corporateDC",
  "rsu",
  "yuchoBenri",
  "yuchoYulin",
  "mizuhoCash",
] as const;

export const CNY_ACCOUNTS = ["wechat", "alipay", "icbc"] as const;

// グラフ用カテゴリ定義
export const CURRENCY_KEYS = [
  { key: "JPY現金・預金",        color: "#10b981" },
  { key: "JPY投資（楽天/DC）",   color: "#3b82f6" },
  { key: "USD（RSU）",           color: "#f59e0b" },
  { key: "CNY自分",              color: "#f43f5e" },
  { key: "妻の資産（Yulin）",    color: "#a78bfa" },
] as const;

export const RISK_KEYS = [
  { key: "低リスク（現金・預金）",      color: "#10b981" },
  { key: "中リスク（株式・投資・年金）", color: "#3b82f6" },
] as const;
