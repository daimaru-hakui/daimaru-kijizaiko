import { getAdminDb } from '@/lib/firebase/admin'
import { parseDocs } from '@/lib/firestore/parse'
import { serialNumberSchema, type SerialNumberDoc } from '@/lib/firestore/schemas'

export type SerialNumbersPageData = {
  serialNumbers: SerialNumberDoc[]
}

export async function getSerialNumbersPageData(): Promise<SerialNumbersPageData> {
  const snap = await getAdminDb().collection('serialNumbers').get()

  return { serialNumbers: parseDocs(snap.docs, serialNumberSchema, 'serialNumbers') }
}
