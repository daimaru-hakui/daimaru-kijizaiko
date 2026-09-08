import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase/admin'
import { verifyApiKey } from '@/lib/auth/api-key'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// 外部システム (daimaru-portal のトップページ「本日登録の裁断報告書」) が参照する。
// Pages Router 時代から URL・レスポンス形式・認可方式を変更できない。
// 取得範囲は旧実装と同じ「直近12時間に登録されたもの」。
const WINDOW_MS = 1000 * 60 * 60 * 12

export async function GET(request: Request) {
  if (!verifyApiKey(request)) {
    return NextResponse.json('error', { status: 405 })
  }

  const db = getAdminDb()
  const since = new Date(Date.now() - WINDOW_MS)

  const [usersSnap, reportsSnap] = await Promise.all([
    db.collection('users').get(),
    db
      .collection('cuttingReports')
      .where('createdAt', '>=', since)
      .orderBy('createdAt', 'desc')
      .get(),
  ])

  const nameByUid = new Map<string, string>()
  for (const doc of usersSnap.docs) {
    const data = doc.data()
    nameByUid.set((data.uid as string) ?? doc.id, (data.name as string) ?? '')
  }

  const contents = reportsSnap.docs.map((doc) => {
    const data = doc.data()
    const staff = String(data.staff ?? '')
    // staff が 'R&D' など users に無い値のこともあるため、その場合は staff をそのまま返す
    return { ...data, id: doc.id, username: nameByUid.get(staff) ?? staff }
  })

  return NextResponse.json({ contents })
}
