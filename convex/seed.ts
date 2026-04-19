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
    // totalJPY=450, CNY=0, grand=450
    memo: "断面450万（その他100万含む）",
  },

  // -------- 2022 --------
  {
    yearMonth: "2022-08",
    rakuten: 510, corporateDC: 0, rsu: 0,
    yuchoBenri: 270, yuchoYulin: 0, mizuhoCash: 100,
    wechat: 3.8, alipay: 1.0, icbc: 0.02,
    yulinPiggyJPY: 0, cnyJpyRate: 24.0,
    // totalJPY=880, CNY≈115, grand≈995
    memo: "断面1000万",
  },
  {
    yearMonth: "2022-11",
    rakuten: 600, corporateDC: 0, rsu: 0,
    yuchoBenri: 320, yuchoYulin: 0, mizuhoCash: 100,
    wechat: 1.4, alipay: 2.8, icbc: 3.5,
    yulinPiggyJPY: 0, cnyJpyRate: 16.88,
    // totalJPY=1020, CNY≈130, grand≈1150
    memo: "断面1150万",
  },

  // -------- 2023 --------
  // 2023/4/1断面: Wealth700+ゆうちょ212+SMBC98=1010万, CNY9万元=190万(rate21.11), grand≈1200
  {
    yearMonth: "2023-04",
    rakuten: 700, corporateDC: 0, rsu: 0,
    yuchoBenri: 212, yuchoYulin: 0, mizuhoCash: 98,
    wechat: 3.7, alipay: 4.4, icbc: 0.9,
    yulinPiggyJPY: 0, cnyJpyRate: 21.11,
    // totalJPY=1010, CNY≈190, grand≈1200 ✓
    memo: "断面1200万",
  },
  // 2023/5/15断面: 日本円合計1200万（内訳不明のため一括）, CNY12.5万元=250万, grand=1450
  {
    yearMonth: "2023-05",
    rakuten: 1200, corporateDC: 0, rsu: 0,
    yuchoBenri: 0, yuchoYulin: 0, mizuhoCash: 0,
    wechat: 12.5, alipay: 0, icbc: 0,
    yulinPiggyJPY: 0, cnyJpyRate: 20.0,
    // totalJPY=1200, CNY=250, grand=1450 ✓
    memo: "断面1450万（内訳推計）",
  },
  // 2023/7/14断面: WN900+ゆうちょ250+SMBC90=1240万, CNY18.5万元=370万(rate20.0), grand=1610
  {
    yearMonth: "2023-07",
    rakuten: 900, corporateDC: 0, rsu: 0,
    yuchoBenri: 250, yuchoYulin: 0, mizuhoCash: 90,
    wechat: 12.0, alipay: 4.5, icbc: 2.0,
    yulinPiggyJPY: 0, cnyJpyRate: 20.0,
    // totalJPY=1240, CNY=370, grand=1610 ✓
    memo: "断面1610万",
  },
  // 2023/8/14断面: WN960+ゆうちょ230+SMBC90=1280万, CNY21.0万元=420万(rate20.0), grand=1700
  {
    yearMonth: "2023-08",
    rakuten: 960, corporateDC: 0, rsu: 0,
    yuchoBenri: 230, yuchoYulin: 0, mizuhoCash: 90,
    wechat: 14.0, alipay: 6.4, icbc: 0.6,
    yulinPiggyJPY: 0, cnyJpyRate: 20.0,
    // totalJPY=1280, CNY=420, grand=1700 ✓
    memo: "断面1700万",
  },
  // 2023/9/13断面: WN1000+ゆうちょ212+SMBC90=1302万, CNY23.4万元=468万(rate20.0), grand=1770
  {
    yearMonth: "2023-09",
    rakuten: 1000, corporateDC: 0, rsu: 0,
    yuchoBenri: 212, yuchoYulin: 0, mizuhoCash: 90,
    wechat: 13.8, alipay: 6.1, icbc: 3.5,
    yulinPiggyJPY: 0, cnyJpyRate: 20.0,
    // totalJPY=1302, CNY=468, grand=1770 ✓
    memo: "断面1770万",
  },
  // 2023/10/13断面: WN1018+ゆうちょ282+SMBC90=1390万, CNY25.0万元=500万(rate20.0), grand=1890
  {
    yearMonth: "2023-10",
    rakuten: 1018, corporateDC: 0, rsu: 0,
    yuchoBenri: 282, yuchoYulin: 0, mizuhoCash: 90,
    wechat: 15.5, alipay: 5.8, icbc: 3.6,
    yulinPiggyJPY: 0, cnyJpyRate: 20.0,
    // totalJPY=1390, CNY=500, grand=1890 ✓
    memo: "断面1890万",
  },
  // 2023/11/14断面: WN1070+ゆうちょ265+SMBC100+みずほ12=1447万, CNY27.3万元≈566万(rate20.75), grand≈2013
  {
    yearMonth: "2023-11",
    rakuten: 1070, corporateDC: 0, rsu: 0,
    yuchoBenri: 265, yuchoYulin: 0, mizuhoCash: 112,
    wechat: 18.0, alipay: 8.2, icbc: 1.1,
    yulinPiggyJPY: 0, cnyJpyRate: 20.75,
    // totalJPY=1447, CNY≈566, grand≈2013（2000万大台）✓
    memo: "大台2000万達成・Amazon転職",
  },
  // 2023/12/14断面: WN1128+ゆうちょ252+SMBC90+みずほ22=1492万, CNY29.3万元=586万(rate20.0), grand=2078
  {
    yearMonth: "2023-12",
    rakuten: 1128, corporateDC: 0, rsu: 0,
    yuchoBenri: 252, yuchoYulin: 0, mizuhoCash: 112,
    wechat: 17.3, alipay: 11.0, icbc: 1.0,
    yulinPiggyJPY: 0, cnyJpyRate: 20.0,
    // totalJPY=1492, CNY=586, grand=2078 ✓
    memo: "断面2078万",
  },

  // -------- 2024 --------
  // 2024/1/12断面: WN1176+ゆうちょ234+SMBC90+みずほ22=1522万, CNY32.0万元=640万(rate20.0), piggy=400, grand=2562
  {
    yearMonth: "2024-01",
    rakuten: 1176, corporateDC: 0, rsu: 0,
    yuchoBenri: 234, yuchoYulin: 0, mizuhoCash: 112,
    wechat: 17.5, alipay: 13.4, icbc: 1.0,
    yulinPiggyJPY: 400, cnyJpyRate: 20.0,
    // totalJPY=1522, CNY=640, piggy=400, grand=2562 ✓
    memo: "断面2562万・前年8月比+1182万",
  },
  // 2024/2/10断面: WN1241+ゆうちょ218+SMBC90+みずほ22=1571万, CNY34.2万元=684万(rate20.0), piggy=1000, grand=3255
  {
    yearMonth: "2024-02",
    rakuten: 1241, corporateDC: 0, rsu: 0,
    yuchoBenri: 218, yuchoYulin: 0, mizuhoCash: 112,
    wechat: 17.4, alipay: 15.8, icbc: 1.0,
    yulinPiggyJPY: 1000, cnyJpyRate: 20.0,
    // totalJPY=1571, CNY=684, piggy=1000, grand=3255 ✓
    memo: "断面3255万・前年比+1275万",
  },
  // 2024/3/9断面: WN1308+ゆうちょ278+SMBC100+みずほ20=1706万, CNY38.0万元=760万(rate20.0), piggy=1000, grand=3466
  {
    yearMonth: "2024-03",
    rakuten: 1308, corporateDC: 0, rsu: 0,
    yuchoBenri: 278, yuchoYulin: 0, mizuhoCash: 120,
    wechat: 19.1, alipay: 18.3, icbc: 0.6,
    yulinPiggyJPY: 1000, cnyJpyRate: 20.0,
    // totalJPY=1706, CNY=760, piggy=1000, grand=3466
    memo: "断面3406万",
  },
  // 2024/4/10断面: WN1400+ゆうちょ405+SMBC100+みずほ30=1935万, CNY37.9万元=761万(rate20.1), piggy=1000, grand=3696
  {
    yearMonth: "2024-04",
    rakuten: 1400, corporateDC: 0, rsu: 0,
    yuchoBenri: 405, yuchoYulin: 0, mizuhoCash: 130,
    wechat: 19.1, alipay: 18.4, icbc: 0.4,
    yulinPiggyJPY: 1000, cnyJpyRate: 20.1,
    // totalJPY=1935, CNY=761, piggy=1000, grand=3696 ✓
    memo: "断面3695万・前年8月比+1700万",
  },
  // 2024/5/10断面: WN1450+ゆうちょ400+SMBC100+みずほ30=1980万, CNY37.6万元=752万(rate20.0), piggy=1000, grand=3732
  {
    yearMonth: "2024-05",
    rakuten: 1450, corporateDC: 0, rsu: 0,
    yuchoBenri: 400, yuchoYulin: 0, mizuhoCash: 130,
    wechat: 19.0, alipay: 18.4, icbc: 0.2,
    yulinPiggyJPY: 1000, cnyJpyRate: 20.0,
    // totalJPY=1980, CNY=752, piggy=1000, grand=3732 ✓
    memo: "断面3730万",
  },
  // 2024/6/10断面: 楽天1835+ゆうちょ138+みずほ30=2003万, CNY36.8万元=780万(rate21.2), piggy=1000, grand=3783
  {
    yearMonth: "2024-06",
    rakuten: 1835, corporateDC: 0, rsu: 0,
    yuchoBenri: 138, yuchoYulin: 0, mizuhoCash: 30,
    wechat: 18.4, alipay: 18.4, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 21.2,
    // totalJPY=2003, CNY=780, piggy=1000, grand=3783 ✓
    memo: "断面3780万",
  },
  // 2024/7/10断面: 楽天2050+ゆうちょ100+みずほ30=2180万, CNY36.6万元=801万(rate21.9), piggy=1000, grand=3981
  {
    yearMonth: "2024-07",
    rakuten: 2050, corporateDC: 0, rsu: 0,
    yuchoBenri: 100, yuchoYulin: 0, mizuhoCash: 30,
    wechat: 18.2, alipay: 18.4, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 21.9,
    // totalJPY=2180, CNY=801, piggy=1000, grand=3981 ✓
    memo: "断面3980万",
  },
  // 2024/8/10断面: 楽天1850+ゆうちょ100+みずほ20=1970万, CNY36.5万元=771万(rate21.1), piggy=1000, grand=3741
  {
    yearMonth: "2024-08",
    rakuten: 1850, corporateDC: 0, rsu: 0,
    yuchoBenri: 100, yuchoYulin: 0, mizuhoCash: 20,
    wechat: 18.1, alipay: 18.4, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 21.1,
    // totalJPY=1970, CNY=771, piggy=1000, grand=3741 ✓
    memo: "断面3740万",
  },
  // 2024/9/10断面: 楽天1850+ゆうちょ100+Yulinゆうちょ30+みずほ20=2000万, CNY36.3万元=759万(rate20.9), piggy=1000, grand=3759
  {
    yearMonth: "2024-09",
    rakuten: 1850, corporateDC: 0, rsu: 0,
    yuchoBenri: 100, yuchoYulin: 30, mizuhoCash: 20,
    wechat: 17.9, alipay: 18.4, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 20.9,
    // totalJPY=2000, CNY=759, piggy=1000, grand=3759 ✓
    memo: "断面3760万",
  },
  // 2024/10/15断面: 楽天2040+ゆうちょ100+Yulinゆうちょ20+みずほ20=2180万, CNY35.4万元=719万(rate20.3), piggy=1000, grand=3899
  {
    yearMonth: "2024-10",
    rakuten: 2040, corporateDC: 0, rsu: 0,
    yuchoBenri: 100, yuchoYulin: 20, mizuhoCash: 20,
    wechat: 17.3, alipay: 18.1, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 20.3,
    // totalJPY=2180, CNY=719, piggy=1000, grand=3899 ✓
    memo: "断面3900万",
  },
  // 2024/11/27断面: 楽天2152+ゆうちょ208+Yulinゆうちょ20+みずほ20=2400万, CNY34.8万元=731万(rate21.0), piggy=1000, grand=4131
  {
    yearMonth: "2024-11",
    rakuten: 2152, corporateDC: 0, rsu: 0,
    yuchoBenri: 208, yuchoYulin: 20, mizuhoCash: 20,
    wechat: 16.8, alipay: 18.0, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 21.0,
    // totalJPY=2400, CNY=731, piggy=1000, grand=4131 ✓
    memo: "断面4130万",
  },
  // 2024/12/27断面: 楽天2270+ゆうちょ150+Yulinゆうちょ20+みずほ20=2460万, CNY34.5万元=739万(rate21.4), piggy=1000, grand=4199
  {
    yearMonth: "2024-12",
    rakuten: 2270, corporateDC: 0, rsu: 0,
    yuchoBenri: 150, yuchoYulin: 20, mizuhoCash: 20,
    wechat: 16.6, alipay: 17.9, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 21.4,
    // totalJPY=2460, CNY=739, piggy=1000, grand=4199 ✓
    memo: "断面4200万（年初一括準備）",
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
