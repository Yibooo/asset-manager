"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth";
import { getCurrentYearMonth, formatYearMonth } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface FormData {
  yearMonth: string;
  rakuten: string;
  corporateDC: string;
  rsuManual: string;
  rsuShares: string;
  rsuVestingRate: string;
  rsuStockPriceUSD: string;
  rsuUsdJpyRate: string;
  yuchoBenri: string;
  yuchoYulin: string;
  mizuhoCash: string;
  wechat: string;
  alipay: string;
  icbc: string;
  yulinPiggyJPY: string;
  cnyJpyRate: string;
  memo: string;
}

const defaultForm: FormData = {
  yearMonth: getCurrentYearMonth(),
  rakuten: "",
  corporateDC: "",
  rsuManual: "",
  rsuShares: "243",
  rsuVestingRate: "5",
  rsuStockPriceUSD: "",
  rsuUsdJpyRate: "155",
  yuchoBenri: "",
  yuchoYulin: "",
  mizuhoCash: "",
  wechat: "",
  alipay: "",
  icbc: "",
  yulinPiggyJPY: "1000",
  cnyJpyRate: "21.5",
  memo: "",
};

type RSUMode = "manual" | "calc";

export default function InputPage() {
  const { token } = useAuth();
  const router = useRouter();
  const upsert = useMutation(api.assets.upsertSnapshot);
  const snapshots = useQuery(api.assets.getSnapshots, { token: token ?? undefined });

  const [form, setForm] = useState<FormData>(defaultForm);
  const [rsuMode, setRsuMode] = useState<RSUMode>("manual");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  // RSU自動計算
  const calcRSU = () => {
    const shares = parseFloat(form.rsuShares) || 0;
    const vestRate = (parseFloat(form.rsuVestingRate) || 0) / 100;
    const price = parseFloat(form.rsuStockPriceUSD) || 0;
    const rate = parseFloat(form.rsuUsdJpyRate) || 0;
    const result = Math.round((shares * vestRate * price * rate) / 10000);
    setForm((f) => ({ ...f, rsuManual: String(result) }));
  };

  // 月次スナップショットから前回値を読み込む
  const loadPrevMonth = () => {
    if (!snapshots || snapshots.length === 0) return;
    const prev = snapshots[snapshots.length - 1];
    setForm({
      yearMonth: getCurrentYearMonth(),
      rakuten: String(prev.rakuten),
      corporateDC: String(prev.corporateDC),
      rsuManual: String(prev.rsu),
      rsuShares: String(prev.rsuShares ?? "243"),
      rsuVestingRate: String(prev.rsuVestingRate ?? "5"),
      rsuStockPriceUSD: String(prev.rsuStockPriceUSD ?? ""),
      rsuUsdJpyRate: String(prev.rsuUsdJpyRate ?? "155"),
      yuchoBenri: String(prev.yuchoBenri),
      yuchoYulin: String(prev.yuchoYulin),
      mizuhoCash: String(prev.mizuhoCash),
      wechat: String(prev.wechat),
      alipay: String(prev.alipay),
      icbc: String(prev.icbc),
      yulinPiggyJPY: String((prev as any).yulinPiggyJPY ?? "1000"),
      cnyJpyRate: String(prev.cnyJpyRate),
      memo: "",
    });
  };

  const totalJPY =
    (parseFloat(form.rakuten) || 0) +
    (parseFloat(form.corporateDC) || 0) +
    (parseFloat(form.rsuManual) || 0) +
    (parseFloat(form.yuchoBenri) || 0) +
    (parseFloat(form.yuchoYulin) || 0) +
    (parseFloat(form.mizuhoCash) || 0);

  const myCNY =
    (parseFloat(form.wechat) || 0) +
    (parseFloat(form.alipay) || 0) +
    (parseFloat(form.icbc) || 0);

  const totalCNYinJPY = Math.round(myCNY * (parseFloat(form.cnyJpyRate) || 0));
  const piggyJPY = parseFloat(form.yulinPiggyJPY) || 0;
  const grandTotal = totalJPY + totalCNYinJPY + piggyJPY;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!token) return; // 【AUTH-BYPASS】
    setLoading(true);
    setError("");

    try {
      await upsert({
        token,
        yearMonth: form.yearMonth,
        rakuten: parseFloat(form.rakuten) || 0,
        corporateDC: parseFloat(form.corporateDC) || 0,
        rsu: parseFloat(form.rsuManual) || 0,
        rsuShares: parseFloat(form.rsuShares) || undefined,
        rsuVestingRate: parseFloat(form.rsuVestingRate) || undefined,
        rsuStockPriceUSD: parseFloat(form.rsuStockPriceUSD) || undefined,
        rsuUsdJpyRate: parseFloat(form.rsuUsdJpyRate) || undefined,
        yuchoBenri: parseFloat(form.yuchoBenri) || 0,
        yuchoYulin: parseFloat(form.yuchoYulin) || 0,
        mizuhoCash: parseFloat(form.mizuhoCash) || 0,
        wechat: parseFloat(form.wechat) || 0,
        alipay: parseFloat(form.alipay) || 0,
        icbc: parseFloat(form.icbc) || 0,
        yulinPiggyJPY: parseFloat(form.yulinPiggyJPY) || 0,
        cnyJpyRate: parseFloat(form.cnyJpyRate) || 21.5,
        memo: form.memo || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    label, fieldKey, placeholder, suffix = "万円", hint,
  }: {
    label: string;
    fieldKey: keyof FormData;
    placeholder?: string;
    suffix?: string;
    hint?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <div className="flex items-center gap-2">
        <input
          type="number"
          step="any"
          value={form[fieldKey]}
          onChange={set(fieldKey)}
          placeholder={placeholder ?? "0"}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-500 w-10 shrink-0">{suffix}</span>
      </div>
    </div>
  );

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-5xl">✅</div>
        <p className="text-lg font-semibold text-gray-800">保存しました！</p>
        <p className="text-sm text-gray-500">ダッシュボードへ移動中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">月次入力</h1>
          <p className="text-sm text-gray-500 mt-0.5">各口座の残高を入力してください（単位：万円 / 万元）</p>
        </div>
        {snapshots && snapshots.length > 0 && (
          <button
            type="button"
            onClick={loadPrevMonth}
            className="text-xs text-blue-600 hover:underline"
          >
            前月値を引き継ぐ
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 年月 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">対象年月</h2>
          <input
            type="month"
            value={form.yearMonth}
            onChange={set("yearMonth")}
            required
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 日本円資産 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">日本円資産（万円）</h2>

          <InputField label="楽天銀行/証券" fieldKey="rakuten" placeholder="3000" />
          <InputField label="企業型DC積立" fieldKey="corporateDC" placeholder="95" />

          {/* RSU */}
          <div className="border border-gray-100 rounded-xl p-4 bg-amber-50/50">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">RSU（株式報酬）</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRsuMode("manual")}
                  className={`text-xs px-2.5 py-1 rounded-full ${rsuMode === "manual" ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-600"}`}
                >
                  手動
                </button>
                <button
                  type="button"
                  onClick={() => setRsuMode("calc")}
                  className={`text-xs px-2.5 py-1 rounded-full ${rsuMode === "calc" ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-600"}`}
                >
                  計算
                </button>
              </div>
            </div>

            {rsuMode === "calc" && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">株数</label>
                  <input type="number" value={form.rsuShares} onChange={set("rsuShares")} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">行使割合（%）</label>
                  <input type="number" value={form.rsuVestingRate} onChange={set("rsuVestingRate")} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">株価（USD）</label>
                  <input type="number" value={form.rsuStockPriceUSD} onChange={set("rsuStockPriceUSD")} placeholder="225" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">USD/JPYレート</label>
                  <input type="number" value={form.rsuUsdJpyRate} onChange={set("rsuUsdJpyRate")} placeholder="155" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-400" />
                </div>
              </div>
            )}

            {rsuMode === "calc" && (
              <button
                type="button"
                onClick={calcRSU}
                className="w-full text-xs bg-amber-100 text-amber-700 py-1.5 rounded-lg mb-3 hover:bg-amber-200 transition-colors"
              >
                計算する →
              </button>
            )}

            <div className="flex items-center gap-2">
              <input
                type="number"
                value={form.rsuManual}
                onChange={set("rsuManual")}
                placeholder="40"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <span className="text-sm text-gray-500 w-10 shrink-0">万円</span>
            </div>
          </div>

          <InputField label="ゆうちょ（本人）" fieldKey="yuchoBenri" placeholder="230" />
          <InputField label="ゆうちょ（Yulin）" fieldKey="yuchoYulin" placeholder="80" />
          <InputField label="みずほ + 現金" fieldKey="mizuhoCash" placeholder="30" />

          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">日本円合計</span>
              <span className="font-bold text-gray-900">{totalJPY.toLocaleString()} 万円</span>
            </div>
          </div>
        </div>

        {/* 人民元資産 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">人民元資産（万元）</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CNY/JPYレート（1元 = X円）</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                value={form.cnyJpyRate}
                onChange={set("cnyJpyRate")}
                placeholder="21.5"
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">円/元</span>
            </div>
          </div>

          <InputField label="WeChat Pay" fieldKey="wechat" suffix="万元" placeholder="8.4" />
          <InputField label="Alipay" fieldKey="alipay" suffix="万元" placeholder="0" />
          <InputField label="工商銀行" fieldKey="icbc" suffix="万元" placeholder="0" />

          <div className="pt-2 border-t border-gray-100 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">自分の人民元合計</span>
              <span className="font-medium text-gray-700">{myCNY.toFixed(1)} 万元</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">円換算</span>
              <span className="font-bold text-gray-900">{totalCNYinJPY.toLocaleString()} 万円</span>
            </div>
          </div>
        </div>

        {/* 猪猪（Yulin資産） */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
          <h2 className="text-sm font-semibold text-gray-800 mb-1">猪猪🐷（Yulin資産・円換算済み）</h2>
          <p className="text-xs text-gray-400 mb-3">例: 50万元 ≈ 1000万円（固定値で入力）</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={form.yulinPiggyJPY}
              onChange={set("yulinPiggyJPY")}
              placeholder="1000"
              className="flex-1 px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <span className="text-sm text-gray-500 w-10 shrink-0">万円</span>
          </div>
        </div>

        {/* 世帯総資産プレビュー */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
          <p className="text-blue-200 text-sm">世帯総資産（プレビュー）</p>
          <p className="text-3xl font-bold mt-1">{grandTotal.toLocaleString()} 万円</p>
          <div className="text-blue-200 text-xs mt-2 space-y-0.5">
            <p>日本円 {totalJPY.toLocaleString()}万円 ＋ 人民元 {totalCNYinJPY.toLocaleString()}万円 ＋ 猪猪 {piggyJPY.toLocaleString()}万円</p>
          </div>
        </div>

        {/* メモ */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">メモ（任意）</label>
          <textarea
            value={form.memo}
            onChange={set("memo")}
            rows={2}
            placeholder="例：史上最高値更新、前年比+650万円"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-2xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
        >
          {loading ? "保存中..." : "保存する"}
        </button>
      </form>
    </div>
  );
}
