"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth";
import {
  formatManYen, getDiffLabel, formatYearMonth,
  ACCOUNT_LABELS, ACCOUNT_COLORS, JPY_ACCOUNTS, CNY_ACCOUNTS,
  CURRENCY_KEYS, RISK_KEYS,
} from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

type ChartMode = "通貨別" | "リスク別";
type PeriodMode = "月別" | "半期別" | "年別";

// 期間モードに応じてスナップショットを集約（各期間の最終月の値を使用）
function aggregateByPeriod(snapshots: any[], period: PeriodMode): Array<any & { label: string }> {
  if (period === "月別") {
    // 全期間表示
    return snapshots.map((s) => ({
      ...s,
      label: s.yearMonth.slice(2).replace("-", "/"),
    }));
  }
  if (period === "年別") {
    const map: Record<string, any> = {};
    for (const s of snapshots) {
      const year = s.yearMonth.split("-")[0];
      map[year] = { ...s, label: year };
    }
    return Object.keys(map).sort().map((k) => map[k]);
  }
  // 半期別
  const map: Record<string, any> = {};
  for (const s of snapshots) {
    const [year, month] = s.yearMonth.split("-");
    const half = parseInt(month) <= 6 ? "H1" : "H2";
    const key = `${year}-${half}`;
    map[key] = { ...s, label: `${year.slice(2)}/${half}` };
  }
  return Object.keys(map).sort().map((k) => map[k]);
}

function buildCurrencyData(snapshots: Array<any & { label: string }>) {
  return snapshots.map((s) => ({
    month: s.label,
    "JPY現金・預金": s.yuchoBenri + s.yuchoYulin + s.mizuhoCash,
    "JPY投資（楽天/DC）": s.rakuten + s.corporateDC,
    "USD（RSU）": s.rsu,
    "CNY自分": s.totalCNYinJPY,
    "妻の資産（Yulin）": s.yulinPiggyJPY ?? 0,
  }));
}

function buildRiskData(snapshots: Array<any & { label: string }>) {
  return snapshots.map((s) => ({
    month: s.label,
    "低リスク（現金・預金）": s.yuchoBenri + s.yuchoYulin + s.mizuhoCash + s.totalCNYinJPY,
    "中リスク（株式・投資・年金）": s.rakuten + s.corporateDC + s.rsu + (s.yulinPiggyJPY ?? 0),
  }));
}

export default function DashboardPage() {
  const { token } = useAuth();
  const latest = useQuery(api.assets.getLatestSnapshot, { token: token ?? undefined });
  const allSnapshots = useQuery(api.assets.getSnapshots, { token: token ?? undefined });
  const seedMutation = useMutation(api.seed.setupAndImport); // 【AUTH-BYPASS】認証不要版
  const [seeding, setSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);
  const [chartMode, setChartMode] = useState<ChartMode>("通貨別");
  const [periodMode, setPeriodMode] = useState<PeriodMode>("月別");

  const handleSeed = async () => {
    // 【AUTH-BYPASS】token不要
    setSeeding(true);
    try {
      await seedMutation({});
      setSeedDone(true);
    } catch {}
    setSeeding(false);
  };

  if (latest === undefined || allSnapshots === undefined) {
    return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">読み込み中...</div>;
  }

  if (!latest) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="text-5xl mb-2">📊</div>
        <h2 className="text-xl font-semibold text-gray-800">データがありません</h2>
        <p className="text-gray-500 text-sm">月次入力から入力するか、過去データをインポートできます</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
          <Link
            href="/input"
            className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            月次入力へ
          </Link>
          <button
            onClick={handleSeed}
            disabled={seeding || seedDone}
            className="inline-block bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {seeding ? "インポート中..." : seedDone ? "完了！再読込してください" : "過去データをインポート（2019〜2025/03）"}
          </button>
        </div>
      </div>
    );
  }

  const prevMonth = allSnapshots[allSnapshots.length - 2];
  const diff = prevMonth ? latest.grandTotal - prevMonth.grandTotal : null;
  const diffJPY = prevMonth ? latest.totalJPY - prevMonth.totalJPY : null;

  const periodSnapshots = aggregateByPeriod(allSnapshots, periodMode);
  const currencyData = buildCurrencyData(periodSnapshots);
  const riskData = buildRiskData(periodSnapshots);
  const chartData = chartMode === "通貨別" ? currencyData : riskData;
  const keys = chartMode === "通貨別" ? CURRENCY_KEYS : RISK_KEYS;

  const yulinPiggy = (latest as any).yulinPiggyJPY ?? 0;

  const pieData = [
    ...JPY_ACCOUNTS.map((key) => ({
      name: ACCOUNT_LABELS[key],
      value: latest[key] as number,
      color: ACCOUNT_COLORS[key],
    })),
    {
      name: "本人CNY資産",
      value: latest.totalCNYinJPY,
      color: "#f43f5e",
    },
    ...(yulinPiggy > 0 ? [{
      name: "妻の資産",
      value: yulinPiggy,
      color: "#a78bfa",
    }] : []),
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-sm text-gray-500 mt-0.5">{formatYearMonth(latest.yearMonth)} 時点</p>
        </div>
        <Link
          href="/input"
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + 月次入力
        </Link>
      </div>

      {/* 総資産カード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-blue-200 text-sm font-medium">世帯総資産</p>
          <p className="text-4xl font-bold mt-1">{formatManYen(latest.grandTotal)}</p>
          {diff !== null && (
            <div className="flex items-center gap-2 mt-3">
              <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${diff >= 0 ? "bg-green-400/20 text-green-200" : "bg-red-400/20 text-red-200"}`}>
                前月比 {getDiffLabel(diff)}
              </span>
            </div>
          )}
          {latest.memo && (
            <p className="text-blue-200 text-xs mt-2 italic">{latest.memo}</p>
          )}
        </div>
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium">本人日本円資産</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{formatManYen(latest.totalJPY)}</p>
            {diffJPY !== null && (
              <p className={`text-xs mt-1 ${diffJPY >= 0 ? "text-green-600" : "text-red-500"}`}>
                前月比 {getDiffLabel(diffJPY)}
              </p>
            )}
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium">本人CNY資産（円換算）</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{formatManYen(latest.totalCNYinJPY)}</p>
            <p className="text-xs text-gray-400 mt-1">レート: 1元 = {latest.cnyJpyRate}円</p>
          </div>
          {yulinPiggy > 0 && (
            <div className="bg-purple-50 rounded-2xl p-4 shadow-sm border border-purple-100">
              <p className="text-xs text-purple-600 font-medium">妻の資産（Yulin）</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatManYen(yulinPiggy)}</p>
            </div>
          )}
        </div>
      </div>

      {/* 積み上げバーチャート（通貨別/リスク別トグル） */}
      {periodSnapshots.length > 1 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h2 className="text-base font-semibold text-gray-800">資産推移</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {/* 期間トグル */}
              <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
                {(["月別", "半期別", "年別"] as PeriodMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPeriodMode(mode)}
                    className={`px-3 py-1.5 font-medium transition-colors ${
                      periodMode === mode
                        ? "bg-gray-700 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              {/* 通貨別/リスク別トグル */}
              <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
                {(["通貨別", "リスク別"] as ChartMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setChartMode(mode)}
                    className={`px-3 py-1.5 font-medium transition-colors ${
                      chartMode === mode
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}万`} />
              <Tooltip
                formatter={(v: number, name: string) => [`${v.toLocaleString()}万円`, name]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {keys.map(({ key, color }) => (
                <Bar key={key} dataKey={key} stackId="a" fill={color} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 口座別残高バー */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4">口座別残高（日本円）</h2>
          <div className="space-y-3">
            {JPY_ACCOUNTS.map((key) => {
              const value = latest[key] as number;
              const pct = latest.totalJPY > 0 ? (value / latest.totalJPY) * 100 : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{ACCOUNT_LABELS[key]}</span>
                    <span className="font-semibold text-gray-900">{value.toLocaleString()}万円</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: ACCOUNT_COLORS[key] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 円グラフ */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4">ポートフォリオ内訳</h2>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => [`${v.toLocaleString()}万円`]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(v) => (v.length > 10 ? v.slice(0, 10) + "…" : v)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 人民元資産（本人分） */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          本人CNY資産（1元 = {latest.cnyJpyRate}円）
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CNY_ACCOUNTS.map((key) => {
            const value = latest[key] as number;
            return (
              <div key={key} className="bg-pink-50 rounded-xl p-3 border border-pink-100">
                <p className="text-xs text-pink-600 font-medium">{ACCOUNT_LABELS[key]}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{value}万元</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  ≈ {Math.round(value * latest.cnyJpyRate).toLocaleString()}万円
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
