"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth";
import { formatManYen, getDiffLabel, formatYearMonth, ACCOUNT_LABELS, ACCOUNT_COLORS, JPY_ACCOUNTS, CNY_ACCOUNTS } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";

export default function DashboardPage() {
  const { token } = useAuth();
  const latest = useQuery(api.assets.getLatestSnapshot, { token: token ?? undefined });
  const allSnapshots = useQuery(api.assets.getSnapshots, { token: token ?? undefined });
  const seedMutation = useMutation(api.seed.seedHistoricalData);
  const [seeding, setSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);

  const handleSeed = async () => {
    if (!token) return;
    setSeeding(true);
    try {
      const result = await seedMutation({ token });
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
            {seeding ? "インポート中..." : seedDone ? "完了！再読込してください" : "過去データをインポート（2024/11〜2025/03）"}
          </button>
        </div>
      </div>
    );
  }

  const prevMonth = allSnapshots[allSnapshots.length - 2];
  const diff = prevMonth ? latest.grandTotal - prevMonth.grandTotal : null;
  const diffJPY = prevMonth ? latest.totalJPY - prevMonth.totalJPY : null;

  const recentSnapshots = allSnapshots.slice(-12);
  const chartData = recentSnapshots.map((s) => ({
    month: s.yearMonth.slice(2).replace("-", "/"),
    総資産: s.grandTotal,
    日本円: s.totalJPY,
    人民元: s.totalCNYinJPY,
  }));

  const pieData = [
    ...JPY_ACCOUNTS.map((key) => ({
      name: ACCOUNT_LABELS[key],
      value: latest[key] as number,
      color: ACCOUNT_COLORS[key],
    })),
    {
      name: "人民元資産",
      value: latest.totalCNYinJPY,
      color: "#f43f5e",
    },
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
            <p className="text-xs text-gray-500 font-medium">日本円資産</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{formatManYen(latest.totalJPY)}</p>
            {diffJPY !== null && (
              <p className={`text-xs mt-1 ${diffJPY >= 0 ? "text-green-600" : "text-red-500"}`}>
                前月比 {getDiffLabel(diffJPY)}
              </p>
            )}
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium">人民元資産（円換算）</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{formatManYen(latest.totalCNYinJPY)}</p>
            <p className="text-xs text-gray-400 mt-1">レート: 1元 = {latest.cnyJpyRate}円</p>
          </div>
        </div>
      </div>

      {/* 推移グラフ */}
      {chartData.length > 1 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4">資産推移（直近12ヶ月）</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}万`} />
              <Tooltip
                formatter={(v: number, name: string) => [`${v.toLocaleString()}万円`, name]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="総資産" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="日本円" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="人民元" stroke="#f43f5e" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
            </LineChart>
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

      {/* 人民元資産 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          人民元資産（1元 = {latest.cnyJpyRate}円）
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
