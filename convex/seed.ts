import { mutation } from "./_generated/server";
import { v } from "convex/values";

// -----------------------------------------------------------------------
// 元データ（2023/11〜2025/03）
// cnyJpyRate は「世帯合計 - JPY合計 - 猪猪1000万」÷ 人民元合計(万元) で逆算
// → Math.round(myCNY * rate) + totalJPY + yulinPiggy = 元データの世帯合計 になるよう保証
// ● (仮) の口座: alipay = 人民元計 − wechat に割り当て、icbc = 0
// 24/02, 24/03 の wechat は「2.4w足す」メモを反映して加算済み
// 24/07〜09 の alipay は Yulin 2万元含む
// -----------------------------------------------------------------------
const HISTORICAL_DATA = [
  // --- 2023年 ---
  {
    yearMonth: "2023-11",
    rakuten: 2152, corporateDC: 0, rsu: 0,
    yuchoBenri: 208, yuchoYulin: 20, mizuhoCash: 20,
    wechat: 16.8, alipay: 18.0, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 20.98,
    // totalJPY=2400, CNYinJPY=730, grand=4130 ✓
    memo: "Amazon転職・断面4130万",
  },
  {
    yearMonth: "2023-12",
    rakuten: 2270, corporateDC: 0, rsu: 0,
    yuchoBenri: 150, yuchoYulin: 20, mizuhoCash: 20,
    wechat: 16.6, alipay: 17.9, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 21.45,
    // totalJPY=2460, CNYinJPY=740, grand=4200 ✓
    memo: "年初2100万から1100万円の増加・断面4200万",
  },

  // --- 2024年 ---
  {
    yearMonth: "2024-01",
    rakuten: 2320, corporateDC: 5, rsu: 0,
    yuchoBenri: 185, yuchoYulin: 20, mizuhoCash: 10,
    wechat: 16.2, alipay: 17.5, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 21.36,
    // totalJPY=2540, CNYinJPY=720, grand=4260 ✓
    memo: "年初から60万円増加・断面4260万",
  },
  {
    yearMonth: "2024-02",
    rakuten: 2330, corporateDC: 12, rsu: 0,
    yuchoBenri: 125, yuchoYulin: 20, mizuhoCash: 33,
    wechat: 16.2, alipay: 17.5, icbc: 0, // wechat: 13.8+2.4=16.2
    yulinPiggyJPY: 1000, cnyJpyRate: 21.36,
    // totalJPY=2520, CNYinJPY=720, grand=4240 ✓
    memo: "年初から40万円増加・断面4240万",
  },
  {
    yearMonth: "2024-03",
    rakuten: 2290, corporateDC: 17, rsu: 0,
    yuchoBenri: 140, yuchoYulin: 20, mizuhoCash: 30,
    wechat: 16.9, alipay: 17.5, icbc: 0, // wechat: 14.5+2.4=16.9
    yulinPiggyJPY: 1000, cnyJpyRate: 20.73,
    // totalJPY=2497, CNYinJPY=713, grand=4210 ✓
    memo: "年初から10万円増加・断面4210万",
  },
  {
    yearMonth: "2024-04",
    rakuten: 2150, corporateDC: 22, rsu: 0,
    yuchoBenri: 80, yuchoYulin: 20, mizuhoCash: 15,
    wechat: 13.5, alipay: 16.3, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 19.90,
    // totalJPY=2287, CNYinJPY=593, grand=3880 ✓
    memo: "断面3880万",
  },
  {
    yearMonth: "2024-05",
    rakuten: 2270, corporateDC: 28, rsu: 0,
    yuchoBenri: 110, yuchoYulin: 20, mizuhoCash: 25,
    wechat: 13.5, alipay: 15.9, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 19.97,
    // totalJPY=2453, CNYinJPY=587, grand=4040 ✓
    memo: "断面4040万",
  },
  {
    yearMonth: "2024-06",
    rakuten: 2400, corporateDC: 34, rsu: 0,
    yuchoBenri: 115, yuchoYulin: 20, mizuhoCash: 31,
    wechat: 12.9, alipay: 15.8, icbc: 0.8,
    yulinPiggyJPY: 1000, cnyJpyRate: 20.0,
    // totalJPY=2600, CNYinJPY=590, grand=4190 ✓
    memo: "断面4190万",
  },
  {
    yearMonth: "2024-07",
    rakuten: 2550, corporateDC: 40, rsu: 0,
    yuchoBenri: 145, yuchoYulin: 20, mizuhoCash: 15,
    wechat: 11.0, alipay: 17.4, icbc: 0.8, // alipay: 15.4+Yulin2.0
    yulinPiggyJPY: 1000, cnyJpyRate: 19.86,
    // totalJPY=2770, CNYinJPY=580, grand=4350 ✓
    memo: "史上最高値更新・断面4350万（Yulin CNY 2万元含む）",
  },
  {
    yearMonth: "2024-08",
    rakuten: 2580, corporateDC: 50, rsu: 0,
    yuchoBenri: 145, yuchoYulin: 20, mizuhoCash: 35,
    wechat: 10.7, alipay: 17.4, icbc: 0.8, // alipay: 15.4+Yulin2.0
    yulinPiggyJPY: 1000, cnyJpyRate: 20.07,
    // totalJPY=2830, CNYinJPY=580, grand=4410 ✓
    memo: "史上最高値更新・断面4410万（Yulin CNY 2万元含む）",
  },
  {
    yearMonth: "2024-09",
    rakuten: 2690, corporateDC: 55, rsu: 0,
    yuchoBenri: 150, yuchoYulin: 20, mizuhoCash: 25,
    wechat: 10.6, alipay: 17.5, icbc: 0.8, // alipay: 15.5+Yulin2.0
    yulinPiggyJPY: 1000, cnyJpyRate: 20.07,
    // totalJPY=2940, CNYinJPY=580, grand=4520 ✓
    memo: "史上最高値更新・断面4520万（Yulin CNY 2万元含む）",
  },
  {
    yearMonth: "2024-10",
    rakuten: 2830, corporateDC: 65, rsu: 0,
    yuchoBenri: 170, yuchoYulin: 20, mizuhoCash: 20,
    wechat: 10.2, alipay: 14.5, icbc: 1.9,
    yulinPiggyJPY: 1000, cnyJpyRate: 20.86,
    // totalJPY=3105, CNYinJPY=555, grand=4660 ✓
    memo: "史上最高値更新・断面4660万",
  },
  {
    yearMonth: "2024-11",
    rakuten: 2900, corporateDC: 70, rsu: 40,
    yuchoBenri: 185, yuchoYulin: 20, mizuhoCash: 35,
    wechat: 9.9, alipay: 14.6, icbc: 1.8,
    yulinPiggyJPY: 1000, cnyJpyRate: 20.91,
    // totalJPY=3250, CNYinJPY=550, grand=4800 ✓
    memo: "史上最高値更新・前年比+670万円・断面4800万",
  },
  {
    yearMonth: "2024-12",
    rakuten: 3000, corporateDC: 75, rsu: 40,
    yuchoBenri: 205, yuchoYulin: 20, mizuhoCash: 20,
    wechat: 9.5, alipay: 13.6, icbc: 1.7,
    yulinPiggyJPY: 1000, cnyJpyRate: 21.77,
    // totalJPY=3360, CNYinJPY=540, grand=4900 ✓
    memo: "史上最高値更新・前年比+650万円・断面4900万",
  },

  // --- 2025年 ---
  {
    yearMonth: "2025-01",
    rakuten: 3000, corporateDC: 85, rsu: 40,
    yuchoBenri: 230, yuchoYulin: 25, mizuhoCash: 20,
    wechat: 8.7, alipay: 15.1, icbc: 0, // alipay: 23.8-8.7=15.1 (●仮●)
    yulinPiggyJPY: 1000, cnyJpyRate: 21.01,
    // totalJPY=3400, CNYinJPY=500, grand=4900 ✓
    memo: "前年比+780万円・断面4900万（ALIPAY/ICBC仮値）",
  },
  {
    yearMonth: "2025-02",
    rakuten: 3050, corporateDC: 90, rsu: 40,
    yuchoBenri: 220, yuchoYulin: 25, mizuhoCash: 40,
    wechat: 8.5, alipay: 15.0, icbc: 0, // alipay: 23.5-8.5=15.0 (●仮●)
    yulinPiggyJPY: 1000, cnyJpyRate: 21.28,
    // totalJPY=3465, CNYinJPY=500, grand=4965 ✓
    memo: "断面4965万（ALIPAY/ICBC仮値）",
  },
  {
    yearMonth: "2025-03",
    rakuten: 3000, corporateDC: 95, rsu: 40,
    yuchoBenri: 230, yuchoYulin: 80, mizuhoCash: 30,
    wechat: 8.4, alipay: 15.0, icbc: 0, // alipay: 23.4-8.4=15.0 (●仮●)
    yulinPiggyJPY: 1000, cnyJpyRate: 22.44,
    // totalJPY=3475, CNYinJPY=525, grand=5000 ✓
    memo: "25年1月比+800万円・断面5000万（ALIPAY/ICBC仮値）・納税17万",
  },
];

// -----------------------------------------------------------------------
// 認証不要の一括インポート（初回セットアップ用）
// Convexダッシュボードの Functions > seed:setupAndImport から実行
// -----------------------------------------------------------------------
export const setupAndImport = mutation({
  args: {},
  handler: async (ctx) => {
    // ユーザーがいなければ作成
    let user = await ctx.db.query("users").first();
    if (!user) {
      const userId = await ctx.db.insert("users", {
        email: "admin@asset-manager.local",
        hashedPassword: "bypass",
        displayName: "管理者",
        createdAt: Date.now(),
      });
      user = await ctx.db.get(userId);
    }
    const userId = user!._id;

    let inserted = 0;
    let updated = 0;

    for (const data of HISTORICAL_DATA) {
      const totalJPY =
        data.rakuten + data.corporateDC + data.rsu +
        data.yuchoBenri + data.yuchoYulin + data.mizuhoCash;

      const myCNY = data.wechat + data.alipay + data.icbc;
      const totalCNYinJPY = Math.round(myCNY * data.cnyJpyRate);
      const grandTotal = totalJPY + totalCNYinJPY + data.yulinPiggyJPY;

      const existing = await ctx.db
        .query("assetSnapshots")
        .withIndex("by_user_month", (q: any) =>
          q.eq("userId", userId).eq("yearMonth", data.yearMonth)
        )
        .unique();

      const record = {
        userId,
        yearMonth: data.yearMonth,
        rakuten: data.rakuten,
        corporateDC: data.corporateDC,
        rsu: data.rsu,
        yuchoBenri: data.yuchoBenri,
        yuchoYulin: data.yuchoYulin,
        mizuhoCash: data.mizuhoCash,
        wechat: data.wechat,
        alipay: data.alipay,
        icbc: data.icbc,
        cnyJpyRate: data.cnyJpyRate,
        yulinPiggyJPY: data.yulinPiggyJPY,
        totalJPY,
        totalCNYinJPY,
        grandTotal,
        memo: data.memo,
        createdAt: Date.now(),
      };

      if (existing) {
        await ctx.db.patch(existing._id, record);
        updated++;
      } else {
        await ctx.db.insert("assetSnapshots", record);
        inserted++;
      }
    }

    return {
      message: `完了！ inserted: ${inserted}, updated: ${updated}`,
      total: HISTORICAL_DATA.length,
    };
  },
});

// 既存の認証付きseed（将来の認証復活時用に残す）
export const seedHistoricalData = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q: any) => q.eq("token", args.token))
      .unique();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("ログインが必要です");
    }

    const userId = session.userId;
    let inserted = 0;

    for (const data of HISTORICAL_DATA) {
      const existing = await ctx.db
        .query("assetSnapshots")
        .withIndex("by_user_month", (q: any) =>
          q.eq("userId", userId).eq("yearMonth", data.yearMonth)
        )
        .unique();

      if (existing) continue;

      const totalJPY =
        data.rakuten + data.corporateDC + data.rsu +
        data.yuchoBenri + data.yuchoYulin + data.mizuhoCash;

      const myCNY = data.wechat + data.alipay + data.icbc;
      const totalCNYinJPY = Math.round(myCNY * data.cnyJpyRate);
      const grandTotal = totalJPY + totalCNYinJPY + data.yulinPiggyJPY;

      await ctx.db.insert("assetSnapshots", {
        userId,
        yearMonth: data.yearMonth,
        rakuten: data.rakuten,
        corporateDC: data.corporateDC,
        rsu: data.rsu,
        yuchoBenri: data.yuchoBenri,
        yuchoYulin: data.yuchoYulin,
        mizuhoCash: data.mizuhoCash,
        wechat: data.wechat,
        alipay: data.alipay,
        icbc: data.icbc,
        cnyJpyRate: data.cnyJpyRate,
        yulinPiggyJPY: data.yulinPiggyJPY,
        totalJPY,
        totalCNYinJPY,
        grandTotal,
        memo: data.memo,
        createdAt: Date.now(),
      });
      inserted++;
    }

    return { inserted, total: HISTORICAL_DATA.length };
  },
});
