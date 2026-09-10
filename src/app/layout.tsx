import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { AppToastContainer } from '@/components/ui/toast'
import './globals.css'

const notoSansJp = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '大丸白衣 生地在庫アプリ',
  description: '生地在庫管理システム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={notoSansJp.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <AppToastContainer />
      </body>
    </html>
  )
}
