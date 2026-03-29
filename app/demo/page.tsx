"use client";

import { MOCK_SNAPSHOTS } from "@/lib/mockData";
import { formatManYen, getDiffLabel, formatYearMonth, ACCOUNT_LABELS, ACCOUNT_COLORS, JPY_ACCOUNTS, CNY_ACCOUNTS } from "@/lib/utils";
import Link from "next/link";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from "recharts";

export default function DemoPage() {
  const snapshots = MOCK_SNAPSHOTS;
  const latest = snapshots[snapshots.length - 1];
  const prev = snapshots[snapshots.length - 2];
  const diff = latest.grandTotal - prev.grandTotal;
  const diffJPY = latest.totalJPY - prev.totalJPY;

  const chartData = snapshots.map((s) => ({
    month: s.yearMonth.slice(2).replace("-", "/"),
    総資産: s.grandTotal,
    日本円: s.totalJPY,
    人民元: s.totalCNYinJPY,
  }));

  const monthlyDiff = snapshots.slice(1).map((s, i) => ({
    month: s.yearMonth.slice(2).replace("-", "/"),
    前月比: s.grandTotal - snapshots[i].grandTotal,
  }));

  const pieData = [
    ...JPY_ACCOUNTS.map((key) => ({
      name: ACCOUNT_LABELS[key],
      value: latest[key as keyof typeof latest] as number,
      color: ACCOUNT_COLORS[key],
    })),
    { name: "人民元資産", value: latest.totalCNYinJPY, color: "#f43f5e" },
  ].filter((d) => d.value > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
        <p className="text-amber-800 text-sm font-medium">
          デモ画面 — 実際のデータを使用した表示サンプルです
          <Link href="/register" className="ml-3 underline text-amber-900 font-semibold">
            アカウント作成してリアルデータを管理 →
          </Link>
        </p>
      </div>

      {/* Sidebar */}
      <div className="flex h-screen">
        <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 fixed top-9 bottom-0">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Asset Manager</p>
                <p className="text-xs text-gray-500">Demo User</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {[
              { label: "ダッシュボード", icon: "📊" },
              { label: "月次入力", icon: "✏️" },
              { label: "推移グラフ", icon: "📈" },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${item.label === "ダッシュボード" ? "bg-blue-50 text-blue-700" : "text-gray-400 cursor-not-allowed"}`}
              >
                <span>{item.icon}</span>
                {item.label}
                {item.label !== "ダッシュボード" && (
                  <span className="ml-auto text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">Demo</span>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="md:ml-56 flex-1 overflow-auto pt-2">
          <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
                <p className="text-sm text-gray-500 mt-0.5">{formatYearMonth(latest.yearMonth)} 時点</p>
              </div>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                無料で始める
              </Link>
            </div>

            {/* 総資産カード */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                <p className="text-blue-200 text-sm font-medium">世帯総資産</p>
                <p className="text-4xl font-bold mt-1">{formatManYen(latest.grandTotal)}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${diff >= 0 ? "bg-green-400/20 text-green-200" : "bg-red-400/20 text-red-200"}`}>
                    前月比 {getDiffLabel(diff)}
                  </span>
                </div>
                {latest.memo && (
                  <p className="text-blue-200 text-xs mt-2 italic">{latest.memo}</p>
                )}
              </div>
              <div className="space-y-3">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">日本円資産</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{formatManYen(latest.totalJPY)}</p>
                  <p className={`text-xs mt-1 ${diffJPY >= 0 ? "text-green-600" : "text-red-500"}`}>
                    前月比 {getDiffLabel(diffJPY)}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">人民元資産（円換算）</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{formatManYen(latest.totalCNYinJPY)}</p>
                  <p className="text-xs text-gray-400 mt-1">レート: 1元 = {latest.cnyJpyRate}円</p>
                </div>
              </div>
            </div>

            {/* 推移グラフ */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold text-gray-800 mb-4">資産推移（万円）</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}万`} domain={["auto", "auto"]} />
                  <Tooltip formatter={(v: number, name: string) => [`${v.toLocaleString()}万円`, name]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="総資産" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="日本円" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="人民元" stroke="#f43f5e" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 月次増減 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold text-gray-800 mb-4">月次増減（万円）</h2>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={monthlyDiff} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}万`} />
                  <Tooltip formatter={(v: number) => [`${v >= 0 ? "+" : ""}${v.toLocaleString()}万円`, "前月比"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="前月比" radius={[4, 4, 0, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 口座別残高 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-semibold text-gray-800 mb-4">口座別残高（日本円）</h2>
                <div className="space-y-3">
                  {JPY_ACCOUNTS.map((key) => {
                    const value = latest[key as keyof typeof latest] as number;
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

              {/* 円グラフ */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-semibold text-gray-800 mb-4">ポートフォリオ内訳</h2>
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v.toLocaleString()}万円`]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => v.length > 10 ? v.slice(0, 10) + "…" : v} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 人民元資産 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold text-gray-800 mb-4">人民元資産（1元 = {latest.cnyJpyRate}円）</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CNY_ACCOUNTS.map((key) => {
                  const value = latest[key as keyof typeof latest] as number;
                  return (
                    <div key={key} className="bg-pink-50 rounded-xl p-3 border border-pink-100">
                      <p className="text-xs text-pink-600 font-medium">{ACCOUNT_LABELS[key]}</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">{value}万元</p>
                      <p className="text-xs text-gray-400 mt-0.5">≈ {Math.round(value * latest.cnyJpyRate).toLocaleString()}万円</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white text-center">
              <h2 className="text-xl font-bold mb-2">あなたの資産も管理しませんか？</h2>
              <p className="text-blue-200 text-sm mb-6">無料でアカウントを作成して、世帯資産の月次管理を始めましょう</p>
              <Link
                href="/register"
                className="inline-block bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors"
              >
                無料で始める
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
