"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
// import { useAuth } from "@/lib/auth"; // 【AUTH-BYPASS】

export default function Home() {
  // 【AUTH-BYPASS START】ログイン機能を一時停止中 - 元に戻すにはコメントアウトを解除
  // const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // if (!isLoading) {
    //   if (token) {
    //     router.replace("/dashboard");
    //   } else {
    //     router.replace("/login");
    //   }
    // }
    router.replace("/dashboard");
  }, [router]);
  // 【AUTH-BYPASS END】

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-gray-400 text-sm">読み込み中...</div>
    </div>
  );
}
