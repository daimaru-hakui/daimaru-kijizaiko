import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { AppShell, type UserRoles } from '@/components/app-shell'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const token = await verifyServerSession()
  if (!token) {
    redirect('/login')
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
    <AppShell userName={userName} roles={roles}>
      {children}
    </AppShell>
  )
}
