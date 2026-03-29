"use client";

import { MOCK_SNAPSHOTS, Snapshot } from "@/lib/mockData";
import { formatManYen, getDiffLabel, formatYearMonth, ACCOUNT_LABELS, ACCOUNT_COLORS, JPY_ACCOUNTS, CNY_ACCOUNTS } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line,
} from "recharts";

type ChartMode = "currency" | "risk";
type Period = "all" | "2y" | "1y";

function buildCurrencyData(snapshots: Snapshot[]) {
  return snapshots.map((s) => ({
    month: s.yearMonth.slice(2).replace("-", "/"),
    "JPY現金・預金": s.yuchoBenri + s.yuchoYulin + s.mizuhoCash,
    "JPY投資（楽天/DC）": s.rakuten + s.corporateDC,
    "USD（RSU）": s.rsu,
    "CNY自分": s.totalCNYinJPY,
    "妻の資産（Yulin）": s.yulinPiggyJPY,
  }));
}

function buildRiskData(snapshots: Snapshot[]) {
  return snapshots.map((s) => ({
    month: s.yearMonth.slice(2).replace("-", "/"),
    "低リスク（現金・預金）": s.yuchoBenri + s.yuchoYulin + s.mizuhoCash + s.totalCNYinJPY,
    "中リスク（株式・投資・年金）": s.rakuten + s.corporateDC + s.rsu + s.yulinPiggyJPY,
  }));
}

const CURRENCY_COLORS = {
  "JPY現金・預金": "#10b981",
  "JPY投資（楽天/DC）": "#3b82f6",
  "USD（RSU）": "#f59e0b",
  "CNY自分": "#f43f5e",
  "妻の資産（Yulin）": "#a78bfa",
};

const RISK_COLORS = {
  "低リスク（現金・預金）": "#10b981",
  "中リスク（株式・投資・年金）": "#3b82f6",
};

export default function DemoPage() {
  const [chartMode, setChartMode] = useState<ChartMode>("currency");
  const [period, setPeriod] = useState<Period>("2y");

  const allSnapshots = MOCK_SNAPSHOTS;
  const latest = allSnapshots[allSnapshots.length - 1];
  const prev = allSnapshots[allSnapshots.length - 2];
  const diff = latest.grandTotal - prev.grandTotal;

  const filtered = period === "all"
    ? allSnapshots
    : period === "2y"
    ? allSnapshots.filter((s) => s.yearMonth >= "2024-01")
    : allSnapshots.filter((s) => s.yearMonth >= "2025-01");

  const currencyData = buildCurrencyData(filtered);
  const riskData = buildRiskData(filtered);

  const trendData = allSnapshots.map((s) => ({
    month: s.yearMonth.length === 7 ? s.yearMonth.slice(2).replace("-", "/") : s.yearMonth,
    総資産: s.grandTotal,
  }));

  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const total = payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0);
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-xs">
        <p className="font-semibold text-gray-700 mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex justify-between gap-4">
            <span style={{ color: p.fill }}>{p.name}</span>
            <span className="font-medium">{p.value?.toLocaleString()}万</span>
          </div>
        ))}
        <div className="border-t mt-1 pt-1 flex justify-between font-bold">
          <span>合計</span>
          <span>{total.toLocaleString()}万</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
        <p className="text-amber-800 text-sm font-medium">
          デモ画面 — 実際のデータを使用したサンプルです
          <Link href="/register" className="ml-3 underline text-amber-900 font-semibold">
            アカウント作成してリアルデータを管理 →
          </Link>
        </p>
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 h-screen sticky top-0">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Asset Manager</p>
                <p className="text-xs text-gray-500">Demo</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {[{ label: "ダッシュボード", icon: "📊", active: true }, { label: "月次入力", icon: "✏️" }, { label: "推移グラフ", icon: "📈" }].map((item) => (
              <div key={item.label} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${item.active ? "bg-blue-50 text-blue-700" : "text-gray-400"}`}>
                <span>{item.icon}</span>{item.label}
              </div>
            ))}
          </nav>
          <div className="p-3 border-t">
            <Link href="/register" className="block w-full bg-blue-600 text-white text-center py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              無料で始める
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
                <p className="text-sm text-gray-500 mt-0.5">{formatYearMonth(latest.yearMonth)} 時点</p>
              </div>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                無料で始める
              </Link>
            </div>

            {/* 総資産カード */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                <p className="text-blue-200 text-sm">世帯総資産</p>
                <p className="text-4xl font-bold mt-1">{formatManYen(latest.grandTotal)}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${diff >= 0 ? "bg-green-400/20 text-green-200" : "bg-red-400/20 text-red-200"}`}>
                    前月比 {getDiffLabel(diff)}
                  </span>
                </div>
                {latest.memo && <p className="text-blue-200 text-xs mt-2 italic">{latest.memo}</p>}
              </div>
              <div className="space-y-3">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500">本人資産（日本円+人民元）</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{formatManYen(latest.totalJPY + latest.totalCNYinJPY)}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500">妻の資産（Yulin）</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{formatManYen(latest.yulinPiggyJPY)}</p>
                </div>
              </div>
            </div>

            {/* 長期トレンド */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">世帯総資産 長期推移（2019〜）</h2>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} interval={3} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}万`} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()}万円`, "総資産"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="総資産" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 2種類グラフ切り替え */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              {/* タブ */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setChartMode("currency")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${chartMode === "currency" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    通貨別
                  </button>
                  <button
                    onClick={() => setChartMode("risk")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${chartMode === "risk" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    リスク別
                  </button>
                </div>
                <div className="flex gap-1">
                  {(["1y", "2y", "all"] as Period[]).map((p) => (
                    <button key={p} onClick={() => setPeriod(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${period === p ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                      {p === "1y" ? "1年" : p === "2y" ? "2年" : "全期間"}
                    </button>
                  ))}
                </div>
              </div>

              {chartMode === "currency" ? (
                <>
                  <p className="text-xs text-gray-500 mb-3">通貨別 / JPY・USD（RSU）・CNY（自分）・妻の資産の内訳</p>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={currencyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} interval={period === "all" ? 5 : 1} />
                      <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}万`} />
                      <Tooltip content={customTooltip} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      {Object.entries(CURRENCY_COLORS).map(([key, color]) => (
                        <Bar key={key} dataKey={key} stackId="a" fill={color} radius={key === "妻の資産（Yulin）" ? [3, 3, 0, 0] : undefined} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-500 mb-3">リスク別 / 低リスク（現金・預金）vs 中リスク（株式・投資・年金）</p>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={riskData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} interval={period === "all" ? 5 : 1} />
                      <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}万`} />
                      <Tooltip content={customTooltip} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      {Object.entries(RISK_COLORS).map(([key, color]) => (
                        <Bar key={key} dataKey={key} stackId="a" fill={color} radius={key === "中リスク（株式・投資・年金）" ? [3, 3, 0, 0] : undefined} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>

            {/* 口座別残高 + 猪猪 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-semibold text-gray-800 mb-4">口座別残高（日本円）</h2>
                <div className="space-y-3">
                  {JPY_ACCOUNTS.map((key) => {
                    const value = latest[key as keyof Snapshot] as number;
                    const pct = latest.totalJPY > 0 ? (value / latest.totalJPY) * 100 : 0;
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{ACCOUNT_LABELS[key]}</span>
                          <span className="font-semibold">{value.toLocaleString()}万円</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: ACCOUNT_COLORS[key] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-semibold text-gray-800 mb-4">人民元資産（1元 = {latest.cnyJpyRate}円）</h2>
                <div className="space-y-3 mb-4">
                  {CNY_ACCOUNTS.map((key) => {
                    const value = latest[key as keyof Snapshot] as number;
                    return (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-600">{ACCOUNT_LABELS[key]}</span>
                        <div className="text-right">
                          <span className="text-sm font-semibold">{value}万元</span>
                          <p className="text-xs text-gray-400">≈ {Math.round(value * latest.cnyJpyRate).toLocaleString()}万円</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-purple-600 font-medium">妻の資産（Yulin）</p>
                      <p className="text-xs text-purple-400">※ 別管理・固定換算</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{formatManYen(latest.yulinPiggyJPY)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 世帯資産内訳サマリー */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold text-gray-800 mb-4">世帯資産内訳サマリー</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "本人 日本円", value: latest.totalJPY, color: "blue" },
                  { label: "本人 人民元", value: latest.totalCNYinJPY, color: "pink" },
                  { label: "妻の資産（Yulin）", value: latest.yulinPiggyJPY, color: "purple" },
                  { label: "世帯合計", value: latest.grandTotal, color: "indigo" },
                ].map((item) => (
                  <div key={item.label} className={`rounded-xl p-4 border bg-${item.color}-50 border-${item.color}-100`}>
                    <p className={`text-xs text-${item.color}-600 font-medium`}>{item.label}</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{formatManYen(item.value)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white text-center">
              <h2 className="text-xl font-bold mb-2">あなたの資産も管理しませんか？</h2>
              <p className="text-blue-200 text-sm mb-6">無料でアカウントを作成して、世帯資産の月次管理を始めましょう</p>
              <Link href="/register" className="inline-block bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors">
                無料で始める
              </Link>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
