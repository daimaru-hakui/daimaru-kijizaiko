import { describe, it, expect } from 'vitest'
import { matchRoute, type UserClaims } from './roles'

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
    // 裁断報告書の一覧は例外的に全員可なので、徳島の入荷予定で確認する
    expect(matchRoute('/tokushima/fabric-purchase/orders', sales)).toBe(false)
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

  // ナビの表示条件 (nav-config.ts) と一致させる。
  // 表示されているのに Forbidden になるのを防ぐ
  describe('ナビの表示条件との整合', () => {
    it('/settings/suppliers は rd のユーザーが通過する', () => {
      const rd: UserClaims = { uid: 'u6', admin: false, rd: true, sales: false, accounting: false, tokushima: false, order: false }
      expect(matchRoute('/settings/suppliers', rd)).toBe(true)
      expect(matchRoute('/settings/stock-places', rd)).toBe(true)
    })

    it('/settings は権限のないユーザーには 403', () => {
      expect(matchRoute('/settings/suppliers', noRole)).toBe(false)
    })

    it('/settings/auth は rd でも 403 (admin 限定)', () => {
      const rd: UserClaims = { uid: 'u6', admin: false, rd: true, sales: false, accounting: false, tokushima: false, order: false }
      expect(matchRoute('/settings/auth', rd)).toBe(false)
      expect(matchRoute('/settings/auth', admin)).toBe(true)
    })

    it('裁断報告書一覧・裁断生地一覧は全ログインユーザーが通過する', () => {
      expect(matchRoute('/tokushima/cutting-reports', noRole)).toBe(true)
      expect(matchRoute('/tokushima/cutting-reports/history', noRole)).toBe(true)
    })

    it('裁断報告書作成は tokushima か rd が必要', () => {
      const rd: UserClaims = { uid: 'u6', admin: false, rd: true, sales: false, accounting: false, tokushima: false, order: false }
      expect(matchRoute('/tokushima/cutting-reports/new', rd)).toBe(true)
      expect(matchRoute('/tokushima/cutting-reports/new', tokushima)).toBe(true)
      expect(matchRoute('/tokushima/cutting-reports/new', noRole)).toBe(false)
    })

    it('徳島の入荷予定一覧は rd も通過する', () => {
      const rd: UserClaims = { uid: 'u6', admin: false, rd: true, sales: false, accounting: false, tokushima: false, order: false }
      expect(matchRoute('/tokushima/fabric-purchase/orders', rd)).toBe(true)
      expect(matchRoute('/tokushima/fabric-purchase/orders', noRole)).toBe(false)
    })
  })
})
