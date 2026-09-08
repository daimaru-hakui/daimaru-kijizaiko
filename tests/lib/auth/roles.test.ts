import { describe, it, expect } from 'vitest'
import { matchRoute, type UserClaims } from '../../../src/lib/auth/roles'

const admin: UserClaims = { uid: 'u1', admin: true, rd: false, sales: false, accounting: false, tokushima: false, order: false }
const tokushima: UserClaims = { uid: 'u2', admin: false, rd: false, sales: false, accounting: false, tokushima: true, order: false }
const sales: UserClaims = { uid: 'u3', admin: false, rd: false, sales: true, accounting: false, tokushima: false, order: false }
const noRole: UserClaims = { uid: 'u4', admin: false, rd: false, sales: false, accounting: false, tokushima: false, order: false }

describe('matchRoute', () => {
  it('/login は認証なしで通過', () => {
    expect(matchRoute('/login', null)).toBe(true)
  })

  it('/ (トップ) は認証なしで通過', () => {
    expect(matchRoute('/', null)).toBe(true)
  })

  it('/tokushima/* は tokushima=true のユーザーが通過', () => {
    expect(matchRoute('/tokushima/cutting-reports', tokushima)).toBe(true)
  })

  it('/tokushima/* は tokushima=false のユーザーに 403', () => {
    expect(matchRoute('/tokushima/cutting-reports', sales)).toBe(false)
  })

  it('/settings/auth は admin=true のユーザーが通過', () => {
    expect(matchRoute('/settings/auth', admin)).toBe(true)
  })

  it('/settings/auth は admin=false のユーザーに 403', () => {
    expect(matchRoute('/settings/auth', noRole)).toBe(false)
  })

  it('認証が必要なルートに未認証アクセスは false', () => {
    expect(matchRoute('/products', null)).toBe(false)
  })

  it('/dashboard は認証済みユーザー全員が通過', () => {
    expect(matchRoute('/dashboard', noRole)).toBe(true)
  })

  it('/accounting-dept は accounting=true のユーザーが通過', () => {
    const acc: UserClaims = { uid: 'u5', admin: false, rd: false, sales: false, accounting: true, tokushima: false, order: false }
    expect(matchRoute('/accounting-dept', acc)).toBe(true)
  })

  it('/accounting-dept は accounting=false のユーザーに 403', () => {
    expect(matchRoute('/accounting-dept', noRole)).toBe(false)
  })

  // 外部システム (daimaru-portal) はセッションクッキーを持てず API_KEY で認可するため、
  // proxy 側では素通しさせる必要がある
  it('/api/cutting-reports は未ログインでも通過する', () => {
    expect(matchRoute('/api/cutting-reports', null)).toBe(true)
  })

  it('/api/cutting-reports の配下も未ログインで通過する', () => {
    expect(matchRoute('/api/cutting-reports/', null)).toBe(true)
  })

  it('定義のない /api/* は未ログインで通過しない', () => {
    expect(matchRoute('/api/products/abc', null)).toBe(false)
  })
})
