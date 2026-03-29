"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth";
import { formatYearMonth, formatManYen, getDiffLabel, ACCOUNT_LABELS, ACCOUNT_COLORS, JPY_ACCOUNTS } from "@/lib/utils";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

export default function HistoryPage() {
  const { token } = useAuth();
  const snapshots = useQuery(api.assets.getSnapshots, { token: token ?? undefined });

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

  const chartData = snapshots.map((s, i) => {
    const prev = snapshots[i - 1];
    return {
      month: s.yearMonth.slice(2).replace("-", "/"),
      yearMonth: s.yearMonth,
      総資産: s.grandTotal,
      日本円: s.totalJPY,
      人民元: s.totalCNYinJPY,
      前月比: prev ? s.grandTotal - prev.grandTotal : 0,
      ...JPY_ACCOUNTS.reduce(
        (acc, key) => ({ ...acc, [ACCOUNT_LABELS[key]]: s[key] as number }),
        {}
      ),
    };
  });

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">推移グラフ</h1>
        <p className="text-sm text-gray-500 mt-0.5">全期間の資産推移</p>
      </div>

      {/* 年別サマリー */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(yearMap).map(([year, data]) => (
          <div key={year} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500">{year}年</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{formatManYen(data.end)}</p>
            <p className={`text-xs mt-1 ${data.diff >= 0 ? "text-green-600" : "text-red-500"}`}>
              {getDiffLabel(data.diff)}
            </p>
          </div>
        ))}
      </div>

      {/* 総資産推移 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 mb-4">世帯総資産推移（万円）</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}万`} />
            <Tooltip
              formatter={(v: number, name: string) => [`${v.toLocaleString()}万円`, name]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="総資産" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="日本円" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
            <Line type="monotone" dataKey="人民元" stroke="#f43f5e" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 前月比バーチャート */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 mb-4">月次増減（万円）</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData.slice(1)} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}万`} />
            <Tooltip
              formatter={(v: number) => [`${v >= 0 ? "+" : ""}${v.toLocaleString()}万円`, "前月比"]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <Bar
              dataKey="前月比"
              radius={[4, 4, 0, 0]}
              fill="#3b82f6"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 口座別積み上げバー */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 mb-4">口座別積み上げ（日本円資産）</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}万`} />
            <Tooltip
              formatter={(v: number, name: string) => [`${v.toLocaleString()}万円`, name]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {JPY_ACCOUNTS.map((key) => (
              <Bar
                key={key}
                dataKey={ACCOUNT_LABELS[key]}
                stackId="jpy"
                fill={ACCOUNT_COLORS[key]}
              />
            ))}
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
                <th className="text-right px-4 py-3 text-gray-500 font-medium">人民元</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">前月比</th>
                <th className="px-4 py-3 text-gray-500 font-medium">メモ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...snapshots].reverse().map((s, i) => {
                const prev = snapshots[snapshots.length - 1 - i - 1];
                const diff = prev ? s.grandTotal - prev.grandTotal : null;
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
                    <td className={`px-4 py-3 text-right text-xs font-medium ${diff === null ? "text-gray-400" : diff >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {diff === null ? "-" : getDiffLabel(diff)}
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
