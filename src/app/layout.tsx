import type { Metadata } from 'next'
import './globals.css'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { AppShell, type UserRoles } from '@/components/app-shell'

export const metadata: Metadata = {
  title: '大丸白衣 生地在庫アプリ',
  description: '生地在庫管理システム',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const token = await verifyServerSession()

  if (!token) {
    return (
      <html lang="ja">
        <body className="min-h-screen bg-background font-sans antialiased">
          {children}
        </body>
      </html>
    )
  }

  const db = getAdminDb()
  const userDoc = await db.collection('users').doc(token.uid).get()
  const data = userDoc.data() ?? {}
  const userName: string = data.name ?? ''
  const roles: UserRoles = {
    admin: !!data.admin,
    rd: !!data.rd,
    tokushima: !!data.tokushima,
    accounting: !!data.accounting,
    sales: !!data.sales,
  }

  return (
    <html lang="ja">
      <body className="min-h-screen bg-background font-sans antialiased">
        <AppShell userName={userName} roles={roles}>
          {children}
        </AppShell>
      </body>
    </html>
  )
}
