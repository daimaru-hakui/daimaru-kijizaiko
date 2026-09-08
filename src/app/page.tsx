import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'

export default async function RootPage() {
  const user = await verifyServerSession()
  if (user) redirect('/dashboard')
  redirect('/login')
}
