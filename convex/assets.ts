import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// 【AUTH-BYPASS】トークンなしの場合は最初のユーザーを使う
async function resolveUserId(
  ctx: { db: any },
  token?: string
): Promise<Id<"users"> | null> {
  if (token) {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q: any) => q.eq("token", token))
      .unique();
    if (!session || session.expiresAt < Date.now()) return null;
    return session.userId;
  }
  // 認証バイパス中：DBの最初のユーザーを使用
  const firstUser = await ctx.db.query("users").first();
  return firstUser?._id ?? null;
}

export const upsertSnapshot = mutation({
  args: {
    token: v.optional(v.string()), // 【AUTH-BYPASS】optional に変更
    yearMonth: v.string(),
    rakuten: v.number(),
    corporateDC: v.number(),
    rsu: v.number(),
    rsuShares: v.optional(v.number()),
    rsuVestingRate: v.optional(v.number()),
    rsuStockPriceUSD: v.optional(v.number()),
    rsuUsdJpyRate: v.optional(v.number()),
    yuchoBenri: v.number(),
    yuchoYulin: v.number(),
    mizuhoCash: v.number(),
    wechat: v.number(),
    alipay: v.number(),
    icbc: v.number(),
    cnyJpyRate: v.number(),
    yulinPiggyJPY: v.number(),
    memo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.token);
    if (!userId) throw new Error("ユーザーが見つかりません");

    const totalJPY =
      args.rakuten + args.corporateDC + args.rsu +
      args.yuchoBenri + args.yuchoYulin + args.mizuhoCash;

    const myCNY = args.wechat + args.alipay + args.icbc;
    const totalCNYinJPY = Math.round(myCNY * args.cnyJpyRate);
    const grandTotal = totalJPY + totalCNYinJPY + args.yulinPiggyJPY;

    const existing = await ctx.db
      .query("assetSnapshots")
      .withIndex("by_user_month", (q: any) =>
        q.eq("userId", userId).eq("yearMonth", args.yearMonth)
      )
      .unique();

    const data = {
      userId,
      yearMonth: args.yearMonth,
      rakuten: args.rakuten,
      corporateDC: args.corporateDC,
      rsu: args.rsu,
      rsuShares: args.rsuShares,
      rsuVestingRate: args.rsuVestingRate,
      rsuStockPriceUSD: args.rsuStockPriceUSD,
      rsuUsdJpyRate: args.rsuUsdJpyRate,
      yuchoBenri: args.yuchoBenri,
      yuchoYulin: args.yuchoYulin,
      mizuhoCash: args.mizuhoCash,
      wechat: args.wechat,
      alipay: args.alipay,
      icbc: args.icbc,
      cnyJpyRate: args.cnyJpyRate,
      yulinPiggyJPY: args.yulinPiggyJPY,
      totalJPY,
      totalCNYinJPY,
      grandTotal,
      memo: args.memo,
      createdAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("assetSnapshots", data);
    }
  },
});

export const getSnapshots = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.token);
    if (!userId) return [];

    const snapshots = await ctx.db
      .query("assetSnapshots")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
    return snapshots.sort((a: any, b: any) => a.yearMonth.localeCompare(b.yearMonth));
  },
});

export const getLatestSnapshot = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.token);
    if (!userId) return null;

    const snapshots = await ctx.db
      .query("assetSnapshots")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
    if (snapshots.length === 0) return null;
    return snapshots.sort((a: any, b: any) => b.yearMonth.localeCompare(a.yearMonth))[0];
  },
});

export const deleteSnapshot = mutation({
  args: { token: v.optional(v.string()), snapshotId: v.id("assetSnapshots") },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.token);
    if (!userId) throw new Error("ユーザーが見つかりません");
    const snapshot = await ctx.db.get(args.snapshotId);
    if (!snapshot || snapshot.userId !== userId) throw new Error("権限がありません");
    await ctx.db.delete(args.snapshotId);
  },
});
