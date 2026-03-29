import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { AuthProvider } from "@/lib/auth";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Asset Manager | 資産管理",
  description: "世帯資産の月次管理・可視化・シミュレーション",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full">
      <body className={`${geist.className} h-full bg-gray-50`}>
        <ConvexClientProvider>
          <AuthProvider>{children}</AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
