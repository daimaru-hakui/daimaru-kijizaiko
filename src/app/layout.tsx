import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "大丸白衣 生地在庫アプリ",
  description: "生地在庫管理システム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
