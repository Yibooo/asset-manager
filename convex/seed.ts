import { mutation } from "./_generated/server";
import { v } from "convex/values";

// -----------------------------------------------------------------------
// フィールドマッピング（新CSV形式 → DBスキーマ）
//   楽天/WN     → rakuten
//   ゆうちょ系   → yuchoBenri（本人+Yulin合算、yuchoYulin=0）
//   SMBC/他     → mizuhoCash
//   DC/RSU      → corporateDC（合算、rsu=0）
//   人民元合計   → wechat（alipay=0, icbc=0）
//
// cnyJpyRate は「本人断面 - totalJPY」÷ 人民元(万元) で逆算
// → Math.round(myCNY * rate) + totalJPY + yulinPiggy = 世帯合計 を保証
// -----------------------------------------------------------------------
const HISTORICAL_DATA = [
  // -------- 2021 --------
  {
    yearMonth: "2021-03",
    rakuten: 0, corporateDC: 0, rsu: 0,
    yuchoBenri: 350, yuchoYulin: 0, mizuhoCash: 100,
    wechat: 0, alipay: 0, icbc: 0,
    yulinPiggyJPY: 0, cnyJpyRate: 21.5,
    // totalJPY=450, CNY=0, grand=450 ✓
    memo: "断面450万（その他100万含む）",
  },

  // -------- 2022 --------
  {
    yearMonth: "2022-08",
    rakuten: 510, corporateDC: 0, rsu: 0,
    yuchoBenri: 270, yuchoYulin: 0, mizuhoCash: 100,
    wechat: 5.0, alipay: 0, icbc: 0,
    yulinPiggyJPY: 0, cnyJpyRate: 24.0,
    // totalJPY=880, CNY=120, grand=1000 ✓
    memo: "断面1000万",
  },
  {
    yearMonth: "2022-11",
    rakuten: 600, corporateDC: 0, rsu: 0,
    yuchoBenri: 320, yuchoYulin: 0, mizuhoCash: 100,
    wechat: 7.7, alipay: 0, icbc: 0,
    yulinPiggyJPY: 0, cnyJpyRate: 16.88,
    // totalJPY=1020, CNY=130, grand=1150 ✓
    memo: "断面1150万",
  },

  // -------- 2023 --------
  {
    yearMonth: "2023-04",
    rakuten: 700, corporateDC: 0, rsu: 0,
    yuchoBenri: 212, yuchoYulin: 0, mizuhoCash: 98,
    wechat: 9.0, alipay: 0, icbc: 0,
    yulinPiggyJPY: 0, cnyJpyRate: 21.11,
    // totalJPY=1010, CNY=190, grand=1200 ✓
    memo: "断面1200万",
  },
  {
    yearMonth: "2023-05",
    // 内訳不明のため推計: 日本円合計1200万をrakutenに一括
    rakuten: 1200, corporateDC: 0, rsu: 0,
    yuchoBenri: 0, yuchoYulin: 0, mizuhoCash: 0,
    wechat: 12.5, alipay: 0, icbc: 0,
    yulinPiggyJPY: 0, cnyJpyRate: 20.0,
    // totalJPY=1200, CNY=250, grand=1450 ✓
    memo: "断面1450万（内訳推計）",
  },
  {
    yearMonth: "2023-07",
    rakuten: 900, corporateDC: 0, rsu: 0,
    yuchoBenri: 250, yuchoYulin: 0, mizuhoCash: 90,
    wechat: 18.5, alipay: 0, icbc: 0,
    yulinPiggyJPY: 0, cnyJpyRate: 20.0,
    // totalJPY=1240, CNY=370, grand=1610 ✓
    memo: "断面1610万",
  },
  {
    yearMonth: "2023-08",
    rakuten: 960, corporateDC: 0, rsu: 0,
    yuchoBenri: 230, yuchoYulin: 0, mizuhoCash: 90,
    wechat: 21.0, alipay: 0, icbc: 0,
    yulinPiggyJPY: 0, cnyJpyRate: 20.0,
    // totalJPY=1280, CNY=420, grand=1700 ✓
    memo: "断面1700万",
  },
  {
    yearMonth: "2023-09",
    rakuten: 1000, corporateDC: 0, rsu: 0,
    yuchoBenri: 212, yuchoYulin: 0, mizuhoCash: 90,
    wechat: 23.4, alipay: 0, icbc: 0,
    yulinPiggyJPY: 0, cnyJpyRate: 20.0,
    // totalJPY=1302, CNY=468, grand=1770 ✓
    memo: "断面1770万",
  },
  {
    yearMonth: "2023-10",
    rakuten: 1018, corporateDC: 0, rsu: 0,
    yuchoBenri: 282, yuchoYulin: 0, mizuhoCash: 90,
    wechat: 25.0, alipay: 0, icbc: 0,
    yulinPiggyJPY: 0, cnyJpyRate: 20.0,
    // totalJPY=1390, CNY=500, grand=1890 ✓
    memo: "断面1890万",
  },
  {
    yearMonth: "2023-11",
    rakuten: 1070, corporateDC: 0, rsu: 0,
    yuchoBenri: 265, yuchoYulin: 0, mizuhoCash: 112,
    wechat: 27.3, alipay: 0, icbc: 0,
    yulinPiggyJPY: 0, cnyJpyRate: 20.26,
    // totalJPY=1447, CNY=553, grand=2000 ✓
    memo: "大台2000万達成",
  },
  {
    yearMonth: "2023-12",
    rakuten: 1128, corporateDC: 0, rsu: 0,
    yuchoBenri: 272, yuchoYulin: 0, mizuhoCash: 112,
    wechat: 29.3, alipay: 0, icbc: 0,
    yulinPiggyJPY: 1422, cnyJpyRate: 19.32,
    // totalJPY=1512, CNY=566, piggy=1422, grand=3500 ✓
    memo: "猪猪15w元換算（1422万）・断面3500万",
  },

  // -------- 2024 --------
  {
    yearMonth: "2024-01",
    rakuten: 2320, corporateDC: 5, rsu: 0,
    yuchoBenri: 205, yuchoYulin: 0, mizuhoCash: 10,
    wechat: 33.7, alipay: 0, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 21.36,
    // totalJPY=2540, CNY=720, grand=4260 ✓
    memo: "断面4260万",
  },
  {
    yearMonth: "2024-02",
    rakuten: 2330, corporateDC: 12, rsu: 0,
    yuchoBenri: 145, yuchoYulin: 0, mizuhoCash: 33,
    wechat: 33.7, alipay: 0, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 21.36,
    // totalJPY=2520, CNY=720, grand=4240 ✓
    memo: "断面4240万",
  },
  {
    yearMonth: "2024-03",
    rakuten: 2290, corporateDC: 17, rsu: 0,
    yuchoBenri: 160, yuchoYulin: 0, mizuhoCash: 30,
    wechat: 34.4, alipay: 0, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 20.73,
    // totalJPY=2497, CNY=713, grand=4210 ✓
    memo: "断面4210万",
  },
  {
    yearMonth: "2024-04",
    rakuten: 2150, corporateDC: 22, rsu: 0,
    yuchoBenri: 100, yuchoYulin: 0, mizuhoCash: 15,
    wechat: 29.5, alipay: 0, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 20.10,
    // totalJPY=2287, CNY=593, grand=3880 ✓
    memo: "断面3880万",
  },
  {
    yearMonth: "2024-05",
    rakuten: 2270, corporateDC: 28, rsu: 0,
    yuchoBenri: 130, yuchoYulin: 0, mizuhoCash: 25,
    wechat: 29.4, alipay: 0, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 19.97,
    // totalJPY=2453, CNY=587, grand=4040 ✓
    memo: "断面4040万",
  },
  {
    yearMonth: "2024-06",
    rakuten: 2400, corporateDC: 34, rsu: 0,
    yuchoBenri: 135, yuchoYulin: 0, mizuhoCash: 31,
    wechat: 29.5, alipay: 0, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 20.0,
    // totalJPY=2600, CNY=590, grand=4190 ✓
    memo: "断面4190万",
  },
  {
    yearMonth: "2024-07",
    rakuten: 2550, corporateDC: 40, rsu: 0,
    yuchoBenri: 165, yuchoYulin: 0, mizuhoCash: 15,
    wechat: 29.2, alipay: 0, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 19.86,
    // totalJPY=2770, CNY=580, grand=4350 ✓
    memo: "断面4350万",
  },
  {
    yearMonth: "2024-08",
    rakuten: 2580, corporateDC: 50, rsu: 0,
    yuchoBenri: 165, yuchoYulin: 0, mizuhoCash: 35,
    wechat: 29.0, alipay: 0, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 20.0,
    // totalJPY=2830, CNY=580, grand=4410 ✓
    memo: "断面4410万",
  },
  {
    yearMonth: "2024-09",
    rakuten: 2690, corporateDC: 55, rsu: 0,
    yuchoBenri: 170, yuchoYulin: 0, mizuhoCash: 25,
    wechat: 29.0, alipay: 0, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 20.0,
    // totalJPY=2940, CNY=580, grand=4520 ✓
    memo: "断面4520万",
  },
  {
    yearMonth: "2024-10",
    rakuten: 2830, corporateDC: 65, rsu: 0,
    yuchoBenri: 190, yuchoYulin: 0, mizuhoCash: 20,
    wechat: 26.6, alipay: 0, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 20.86,
    // totalJPY=3105, CNY=555, grand=4660 ✓
    memo: "断面4660万",
  },
  {
    yearMonth: "2024-11",
    rakuten: 2900, corporateDC: 110, rsu: 0,
    yuchoBenri: 205, yuchoYulin: 0, mizuhoCash: 35,
    wechat: 26.3, alipay: 0, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 20.91,
    // totalJPY=3250, CNY=550, grand=4800 ✓
    memo: "最高値更新・断面4800万",
  },
  {
    yearMonth: "2024-12",
    rakuten: 3000, corporateDC: 115, rsu: 0,
    yuchoBenri: 225, yuchoYulin: 0, mizuhoCash: 20,
    wechat: 24.8, alipay: 0, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 21.77,
    // totalJPY=3360, CNY=540, grand=4900 ✓
    memo: "最高値更新・断面4900万",
  },

  // -------- 2025 --------
  {
    yearMonth: "2025-01",
    rakuten: 3000, corporateDC: 125, rsu: 0,
    yuchoBenri: 255, yuchoYulin: 0, mizuhoCash: 20,
    wechat: 23.8, alipay: 0, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 21.01,
    // totalJPY=3400, CNY=500, grand=4900 ✓
    memo: "断面4900万・商品券80",
  },
  {
    yearMonth: "2025-02",
    rakuten: 3050, corporateDC: 130, rsu: 0,
    yuchoBenri: 245, yuchoYulin: 0, mizuhoCash: 40,
    wechat: 23.5, alipay: 0, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 21.28,
    // totalJPY=3465, CNY=500, grand=4965 ✓
    memo: "断面4965万・商品券80",
  },
  {
    yearMonth: "2025-03",
    rakuten: 3000, corporateDC: 135, rsu: 0,
    yuchoBenri: 310, yuchoYulin: 0, mizuhoCash: 30,
    wechat: 23.4, alipay: 0, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 22.44,
    // totalJPY=3475, CNY=525, grand=5000 ✓
    memo: "断面5000万・確定申告-17万・商品券80",
  },
];

// -----------------------------------------------------------------------
// 認証不要の一括インポート（初回セットアップ＆上書き更新用）
// Convexダッシュボード or ダッシュボード画面のボタンから実行
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

// 既存の認証付きseed（将来の認証復活時用）
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
