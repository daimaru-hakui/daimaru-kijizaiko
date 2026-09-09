import { describe, it, expect } from 'vitest'
import { buildUsersMap } from './map'

function doc(id: string, data: Record<string, unknown>) {
  return { id, data: () => data }
}

describe('buildUsersMap', () => {
  it('uid をキー、name を値にする', () => {
    expect(buildUsersMap([doc('u1', { name: '山田' })])).toEqual({ u1: '山田' })
  })

  it('name が無いユーザーは uid をそのまま表示名にする', () => {
    expect(buildUsersMap([doc('u2', {})])).toEqual({ u2: 'u2' })
  })
})
