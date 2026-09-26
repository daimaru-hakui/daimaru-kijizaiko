import { redirect } from 'next/navigation'
import { verifyServerSession, getProxyUserProfile } from '@/lib/auth/session'
import { getAppShellUser, toAppShellUser } from '@/lib/users/queries'
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

  // proxy が同一リクエストで読んだ users ドキュメントがあれば Firestore を読み直さない
  const profile = await getProxyUserProfile()
  const { userName, roles } = profile
    ? toAppShellUser(profile)
    : await getAppShellUser(token.uid)

  return (
    <AppShell userName={userName} userEmail={token.email ?? ''} roles={roles}>
      {children}
    </AppShell>
  )
}
