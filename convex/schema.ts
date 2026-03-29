import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    hashedPassword: v.string(),
    displayName: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_token", ["token"]),

  assetSnapshots: defineTable({
    userId: v.id("users"),
    yearMonth: v.string(), // "2026-03"
    // 日本円資産（万円）
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
    // 人民元資産（万元）
    wechat: v.number(),
    alipay: v.number(),
    icbc: v.number(),
    yulinCNY: v.number(),
    cnyJpyRate: v.number(), // 1元 = X円
    // 集計（万円）
    totalJPY: v.number(),
    totalCNYinJPY: v.number(),
    grandTotal: v.number(),
    memo: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user_month", ["userId", "yearMonth"])
    .index("by_user", ["userId"]),
});
