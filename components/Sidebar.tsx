"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: "📊" },
  { href: "/input", label: "月次入力", icon: "✏️" },
  { href: "/history", label: "推移グラフ", icon: "📈" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { token, displayName, clearAuth } = useAuth();
  const logout = useMutation(api.auth.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    if (token) {
      try {
        await logout({ token });
      } catch {}
    }
    clearAuth();
    router.replace("/login");
  };

  const NavLinks = () => (
    <>
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Asset Manager</p>
            <p className="text-xs text-gray-500">{displayName}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === item.href
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <span className="text-base">🚪</span>
          ログアウト
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 h-full fixed left-0 top-0">
        <NavLinks />
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">Asset Manager</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-20 bg-black/30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-20 h-full w-64 bg-white shadow-xl flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavLinks />
      </aside>
    </>
  );
}
