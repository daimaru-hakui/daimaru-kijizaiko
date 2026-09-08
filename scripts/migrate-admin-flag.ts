/**
 * 旧ハードコード管理者 3 UID に admin:true を付与するマイグレーションスクリプト。
 * 実行: DRY_RUN=true pnpm tsx scripts/migrate-admin-flag.ts
 *        DRY_RUN=false pnpm tsx scripts/migrate-admin-flag.ts
 */
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const LEGACY_ADMIN_UIDS = [
  'fgzmLExAiAcFcikzqHpqe7avIfu2',
  'EE7aC3Q3O8Q7dB7sKlFXqfQaZO22',
  'B6W7Ux55Ffbsyf9hc7RoTsVtOln1',
]

const isDryRun = process.env.DRY_RUN !== 'false'

async function main() {
  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!)
    initializeApp({ credential: cert(serviceAccount) })
  }
  const db = getFirestore(getApp())

  console.log(`[migrate-admin-flag] dry-run: ${isDryRun}`)

  const usersSnap = await db
    .collection('users')
    .where('uid', 'in', LEGACY_ADMIN_UIDS)
    .get()

  if (usersSnap.empty) {
    console.log('対象ユーザーが見つかりませんでした。uid フィールドを確認してください。')
    process.exit(0)
  }

  for (const doc of usersSnap.docs) {
    const data = doc.data()
    console.log(`  uid=${data.uid} name=${data.name} admin=${data.admin ?? '(なし)'}`)
    if (!isDryRun) {
      await doc.ref.update({ admin: true })
      console.log(`    → admin: true に更新しました`)
    }
  }

  if (isDryRun) {
    console.log('\n[dry-run] 変更なし。DRY_RUN=false で再実行すると実際に更新されます。')
  } else {
    console.log('\n完了しました。')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
