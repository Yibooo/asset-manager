"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth";
import {
  formatYearMonth, formatManYen, getDiffLabel,
  ACCOUNT_LABELS, ACCOUNT_COLORS, JPY_ACCOUNTS,
  CURRENCY_KEYS, RISK_KEYS,
} from "@/lib/utils";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

type ChartMode = "通貨別" | "リスク別";
type PeriodMode = "1年" | "2年" | "全期間";

function buildCurrencyData(snapshots: any[]) {
  return snapshots.map((s) => ({
    month: s.yearMonth.slice(2).replace("-", "/"),
    "JPY現金・預金": s.yuchoBenri + s.yuchoYulin + s.mizuhoCash,
    "JPY投資（楽天/DC）": s.rakuten + s.corporateDC,
    "USD（RSU）": s.rsu,
    "CNY自分": s.totalCNYinJPY,
    "妻の資産（Yulin）": s.yulinPiggyJPY ?? 0,
  }));
}

function buildRiskData(snapshots: any[]) {
  return snapshots.map((s) => ({
    month: s.yearMonth.slice(2).replace("-", "/"),
    "低リスク（現金・預金）": s.yuchoBenri + s.yuchoYulin + s.mizuhoCash + s.totalCNYinJPY,
    "中リスク（株式・投資・年金）": s.rakuten + s.corporateDC + s.rsu + (s.yulinPiggyJPY ?? 0),
  }));
}

export default function HistoryPage() {
  const { token } = useAuth();
  const snapshots = useQuery(api.assets.getSnapshots, { token: token ?? undefined });
  const [chartMode, setChartMode] = useState<ChartMode>("通貨別");
  const [period, setPeriod] = useState<PeriodMode>("全期間");

  if (snapshots === undefined) {
    return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">読み込み中...</div>;
  }

  if (snapshots.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">📈</div>
        <p className="text-gray-500">データがまだありません。月次入力から入力してください。</p>
      </div>
    );
  }

  const periodCount = period === "1年" ? 12 : period === "2年" ? 24 : snapshots.length;
  const filtered = snapshots.slice(-periodCount);

  const currencyData = buildCurrencyData(filtered);
  const riskData = buildRiskData(filtered);
  const chartData = chartMode === "通貨別" ? currencyData : riskData;
  const keys = chartMode === "通貨別" ? CURRENCY_KEYS : RISK_KEYS;

  // 年別集計
  const yearMap: Record<string, { start: number; end: number; diff: number }> = {};
  snapshots.forEach((s) => {
    const year = s.yearMonth.slice(0, 4);
    if (!yearMap[year]) {
      yearMap[year] = { start: s.grandTotal, end: s.grandTotal, diff: 0 };
    } else {
      yearMap[year].end = s.grandTotal;
    }
  });
  Object.keys(yearMap).forEach((year) => {
    yearMap[year].diff = yearMap[year].end - yearMap[year].start;
  });

  // 前月比データ
  const diffData = filtered.slice(1).map((s, i) => ({
    month: s.yearMonth.slice(2).replace("-", "/"),
    前月比: s.grandTotal - filtered[i].grandTotal,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">推移グラフ</h1>
        <p className="text-sm text-gray-500 mt-0.5">全期間の資産推移</p>
      </div>

      {/* 年別サマリー */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 overflow-x-auto">
        <div className="contents">
          {Object.entries(yearMap).map(([year, data]) => (
            <div key={year} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 min-w-[120px]">
              <p className="text-xs text-gray-500">{year}年</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{formatManYen(data.end)}</p>
              <p className={`text-xs mt-1 ${data.diff >= 0 ? "text-green-600" : "text-red-500"}`}>
                {getDiffLabel(data.diff)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 積み上げバーチャート */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-semibold text-gray-800">資産内訳推移（万円）</h2>
          <div className="flex gap-2 flex-wrap">
            {/* 期間トグル */}
            <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
              {(["1年", "2年", "全期間"] as PeriodMode[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    period === p ? "bg-gray-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            {/* チャートモードトグル */}
            <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
              {(["通貨別", "リスク別"] as ChartMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setChartMode(mode)}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    chartMode === mode ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} interval="preserveStartEnd" />
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

      {/* 前月比バーチャート */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 mb-4">月次増減（万円）</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={diffData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}万`} />
            <Tooltip
              formatter={(v: number) => [`${v >= 0 ? "+" : ""}${v.toLocaleString()}万円`, "前月比"]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <Bar dataKey="前月比" radius={[4, 4, 0, 0]} fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 一覧テーブル */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">月次データ一覧</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">年月</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">世帯総資産</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">日本円</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">本人CNY</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">妻の資産</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">前月比</th>
                <th className="px-4 py-3 text-gray-500 font-medium">メモ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...snapshots].reverse().map((s, i) => {
                const prev = snapshots[snapshots.length - 1 - i - 1];
                const d = prev ? s.grandTotal - prev.grandTotal : null;
                const piggy = (s as any).yulinPiggyJPY ?? 0;
                return (
                  <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatYearMonth(s.yearMonth)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      {s.grandTotal.toLocaleString()}万
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {s.totalJPY.toLocaleString()}万
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {s.totalCNYinJPY.toLocaleString()}万
                    </td>
                    <td className="px-4 py-3 text-right text-purple-600 font-medium">
                      {piggy > 0 ? `${piggy.toLocaleString()}万` : "-"}
                    </td>
                    <td className={`px-4 py-3 text-right text-xs font-medium ${d === null ? "text-gray-400" : d >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {d === null ? "-" : getDiffLabel(d)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 max-w-[140px] truncate">
                      {s.memo ?? ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
