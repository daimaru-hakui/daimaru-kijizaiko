import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAppShellUser } from '@/lib/users/queries'
import { AppShell } from '@/components/app-shell'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const token = await verifyServerSession()
  if (!token) {
    redirect('/login')
  }

  const { userName, roles } = await getAppShellUser(token.uid)

  return (
    <AppShell userName={userName} roles={roles}>
      {children}
    </AppShell>
  )
}
