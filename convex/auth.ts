import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30日

export const register = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .unique();

    if (existing) {
      throw new Error("このメールアドレスはすでに登録されています");
    }

    const hashedPassword = await bcrypt.hash(args.password, 10);

    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      hashedPassword,
      displayName: args.displayName,
      createdAt: Date.now(),
    });

    const token = crypto.randomUUID();
    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt: Date.now() + SESSION_DURATION_MS,
      createdAt: Date.now(),
    });

    return { token, userId, displayName: args.displayName };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .unique();

    if (!user) {
      throw new Error("メールアドレスまたはパスワードが正しくありません");
    }

    const valid = await bcrypt.compare(args.password, user.hashedPassword);
    if (!valid) {
      throw new Error("メールアドレスまたはパスワードが正しくありません");
    }

    const token = crypto.randomUUID();
    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt: Date.now() + SESSION_DURATION_MS,
      createdAt: Date.now(),
    });

    return { token, userId: user._id, displayName: user.displayName };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

export const getMe = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return null;

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token!))
      .unique();

    if (!session || session.expiresAt < Date.now()) return null;

    const user = await ctx.db.get(session.userId);
    if (!user) return null;

    return {
      userId: user._id,
      email: user.email,
      displayName: user.displayName,
    };
  },
});
