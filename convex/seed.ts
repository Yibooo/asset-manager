import { mutation } from "./_generated/server";
import { v } from "convex/values";

const HISTORICAL_DATA = [
  {
    yearMonth: "2024-11",
    rakuten: 2900, corporateDC: 70, rsu: 40,
    yuchoBenri: 185, yuchoYulin: 20, mizuhoCash: 35,
    wechat: 9.9, alipay: 14.6, icbc: 1.8,
    yulinPiggyJPY: 1000, cnyJpyRate: 20.9,
    memo: "史上最高値更新・前年比+670万円",
  },
  {
    yearMonth: "2024-12",
    rakuten: 3000, corporateDC: 75, rsu: 40,
    yuchoBenri: 205, yuchoYulin: 20, mizuhoCash: 20,
    wechat: 9.5, alipay: 13.6, icbc: 1.7,
    yulinPiggyJPY: 1000, cnyJpyRate: 21.8,
    memo: "史上最高値更新・前年比+650万円",
  },
  {
    yearMonth: "2025-01",
    rakuten: 3000, corporateDC: 85, rsu: 40,
    yuchoBenri: 230, yuchoYulin: 25, mizuhoCash: 20,
    wechat: 8.7, alipay: 0, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 21.0,
    memo: "前年比+780万円",
  },
  {
    yearMonth: "2025-02",
    rakuten: 3050, corporateDC: 90, rsu: 40,
    yuchoBenri: 220, yuchoYulin: 25, mizuhoCash: 40,
    wechat: 8.5, alipay: 0, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 21.3,
    memo: "",
  },
  {
    yearMonth: "2025-03",
    rakuten: 3000, corporateDC: 95, rsu: 40,
    yuchoBenri: 230, yuchoYulin: 80, mizuhoCash: 30,
    wechat: 8.4, alipay: 0, icbc: 0,
    yulinPiggyJPY: 1000, cnyJpyRate: 21.4,
    memo: "25年1月比+800万円",
  },
];

export const seedHistoricalData = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("ログインが必要です");
    }

    const userId = session.userId;
    let inserted = 0;

    for (const data of HISTORICAL_DATA) {
      const existing = await ctx.db
        .query("assetSnapshots")
        .withIndex("by_user_month", (q) =>
          q.eq("userId", userId).eq("yearMonth", data.yearMonth)
        )
        .unique();

      if (existing) continue;

      const totalJPY =
        data.rakuten +
        data.corporateDC +
        data.rsu +
        data.yuchoBenri +
        data.yuchoYulin +
        data.mizuhoCash;

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
        yulinPiggyJPY: data.yulinPiggyJPY,
        cnyJpyRate: data.cnyJpyRate,
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
