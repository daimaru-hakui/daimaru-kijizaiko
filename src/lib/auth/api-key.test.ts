import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { verifyApiKey } from './api-key'

const ORIGINAL = process.env.BACKEND_API_KEY

beforeEach(() => {
  process.env.BACKEND_API_KEY = 'secret-key'
})

afterEach(() => {
  process.env.BACKEND_API_KEY = ORIGINAL
})

function request(query: string, headers?: HeadersInit) {
  return new Request(`https://example.com/api/products${query}`, { headers })
}

describe('verifyApiKey', () => {
  it('API_KEY クエリが一致するとき true を返す', () => {
    expect(verifyApiKey(request('?API_KEY=secret-key'))).toBe(true)
  })

  it('API_KEY クエリが一致しないとき false を返す', () => {
    expect(verifyApiKey(request('?API_KEY=wrong'))).toBe(false)
  })

  it('API_KEY クエリがないとき false を返す', () => {
    expect(verifyApiKey(request(''))).toBe(false)
  })

  it('Authorization: Bearer ヘッダーが一致するとき true を返す', () => {
    expect(verifyApiKey(request('', { Authorization: 'Bearer secret-key' }))).toBe(true)
  })

  it('Authorization: Bearer ヘッダーが一致しないとき false を返す', () => {
    expect(verifyApiKey(request('', { Authorization: 'Bearer wrong' }))).toBe(false)
  })

  it('Bearer 以外のスキームは受け付けない', () => {
    expect(verifyApiKey(request('', { Authorization: 'Basic secret-key' }))).toBe(false)
  })

  it('ヘッダーがあるときはクエリより優先する', () => {
    expect(
      verifyApiKey(request('?API_KEY=secret-key', { Authorization: 'Bearer wrong' })),
    ).toBe(false)
  })

  it('サーバー側に BACKEND_API_KEY が設定されていないとき常に false を返す', () => {
    delete process.env.BACKEND_API_KEY
    expect(verifyApiKey(request('?API_KEY=secret-key'))).toBe(false)
    expect(verifyApiKey(request('', { Authorization: 'Bearer secret-key' }))).toBe(false)
    expect(verifyApiKey(request(''))).toBe(false)
  })
})
