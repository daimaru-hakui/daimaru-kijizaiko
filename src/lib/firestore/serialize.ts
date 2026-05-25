import { Timestamp, GeoPoint, DocumentReference } from 'firebase-admin/firestore'

function isDocumentRef(v: unknown): boolean {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as Record<string, unknown>).path === 'string' &&
    typeof (v as Record<string, unknown>).id === 'string' &&
    'firestore' in (v as object)
  )
}

export function toPlainData(value: unknown): unknown {
  if (value === null || value === undefined) return value
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (value instanceof GeoPoint) return { latitude: value.latitude, longitude: value.longitude }
  if (value instanceof DocumentReference || isDocumentRef(value)) {
    return (value as { path: string }).path
  }
  if (Array.isArray(value)) return value.map(toPlainData)
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = toPlainData(v)
    }
    return out
  }
  return value
}
