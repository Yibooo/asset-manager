"use client";

// import { useEffect } from "react"; // 【AUTH-BYPASS】
// import { useRouter } from "next/navigation"; // 【AUTH-BYPASS】
// import { useAuth } from "@/lib/auth"; // 【AUTH-BYPASS】
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 【AUTH-BYPASS START】認証ガードを一時停止中 - 元に戻すにはコメントアウトを解除
  // const { token, isLoading } = useAuth();
  // const router = useRouter();

  // useEffect(() => {
  //   if (!isLoading && !token) {
  //     router.replace("/login");
  //   }
  // }, [token, isLoading, router]);

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gray-50">
  //       <div className="text-gray-400 text-sm">読み込み中...</div>
  //     </div>
  //   );
  // }

  // if (!token) return null;
  // 【AUTH-BYPASS END】

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="md:ml-56 pt-14 md:pt-0 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
