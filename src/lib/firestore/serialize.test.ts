import { describe, it, expect } from 'vitest'
import { Timestamp, GeoPoint } from 'firebase-admin/firestore'
import { toPlainData } from './serialize'

describe('toPlainData', () => {
  it('プリミティブ値はそのまま返す', () => {
    expect(toPlainData(42)).toBe(42)
    expect(toPlainData('hello')).toBe('hello')
    expect(toPlainData(true)).toBe(true)
    expect(toPlainData(null)).toBeNull()
    expect(toPlainData(undefined)).toBeUndefined()
  })

  it('Timestamp を ISO 文字列に変換する', () => {
    const ts = Timestamp.fromDate(new Date('2026-01-15T00:00:00.000Z'))
    const result = toPlainData(ts)
    expect(result).toBe('2026-01-15T00:00:00.000Z')
  })

  it('GeoPoint を {latitude, longitude} プレーンオブジェクトに変換する', () => {
    const gp = new GeoPoint(35.6895, 139.6917)
    const result = toPlainData(gp)
    expect(result).toEqual({ latitude: 35.6895, longitude: 139.6917 })
  })

  it('DocumentReference 風スタブ（循環参照あり）を path 文字列に変換し JSON.stringify が通る', () => {
    // 実際の DocumentReference は Firestore インスタンスへの循環参照を持つ
    const circularFirestore: Record<string, unknown> = {}
    const ref = { path: 'products/abc123', id: 'abc123', firestore: circularFirestore }
    // circularFirestore 自体が ref を参照 → 循環
    circularFirestore.ref = ref

    const result = toPlainData(ref)
    expect(result).toBe('products/abc123')
    // JSON.stringify が例外を投げないことを確認
    expect(() => JSON.stringify(result)).not.toThrow()
  })

  it('配列の各要素を再帰変換する', () => {
    const ts = Timestamp.fromDate(new Date('2026-03-01T00:00:00.000Z'))
    const result = toPlainData([ts, 'text', 1])
    expect(result).toEqual(['2026-03-01T00:00:00.000Z', 'text', 1])
  })

  it('ネストしたプレーンオブジェクト内の Timestamp を変換する', () => {
    const ts = Timestamp.fromDate(new Date('2026-06-01T00:00:00.000Z'))
    const obj = { name: 'test', inner: { ts, count: 5 } }
    const result = toPlainData(obj) as Record<string, unknown>
    expect((result.inner as Record<string, unknown>).ts).toBe('2026-06-01T00:00:00.000Z')
    expect((result.inner as Record<string, unknown>).count).toBe(5)
    expect(result.name).toBe('test')
  })

  it('DocumentReference を含むオブジェクトを変換した結果が JSON.stringify-able', () => {
    const circularFirestore: Record<string, unknown> = {}
    const ref = { path: 'suppliers/sup1', id: 'sup1', firestore: circularFirestore }
    circularFirestore.ref = ref

    const doc = {
      productId: 'p1',
      supplierRef: ref,
      quantity: 100,
    }
    const result = toPlainData(doc)
    expect(() => JSON.stringify(result)).not.toThrow()
    expect((result as Record<string, unknown>).supplierRef).toBe('suppliers/sup1')
    expect((result as Record<string, unknown>).productId).toBe('p1')
  })
})
