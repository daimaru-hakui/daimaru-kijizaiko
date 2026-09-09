import { describe, it, expect } from 'vitest'
import { Timestamp } from 'firebase-admin/firestore'
import { withId } from './with-id'

function doc(id: string, data: Record<string, unknown>) {
  return { id, data: () => data }
}

describe('withId', () => {
  it('ドキュメント ID を id として付ける', () => {
    const result = withId<{ id: string; name: string }>(doc('abc', { name: '生地A' }))
    expect(result).toEqual({ id: 'abc', name: '生地A' })
  })

  it('createdAt / updatedAt は Client に渡せないので落とす', () => {
    const now = Timestamp.fromMillis(0)
    const result = withId<{ id: string }>(doc('abc', { createdAt: now, updatedAt: now, name: 'x' }))
    expect(result).not.toHaveProperty('createdAt')
    expect(result).not.toHaveProperty('updatedAt')
  })

  it('ネストした Timestamp はプレーンな値に変換する', () => {
    const result = withId<{ id: string; fixedAt: unknown }>(
      doc('abc', { fixedAt: Timestamp.fromMillis(0) }),
    )
    expect(typeof result.fixedAt).toBe('string')
  })
})
