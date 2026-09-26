import { describe, it, expect } from 'vitest'
import {
  PROXY_SESSION_HEADER,
  encodeProxySession,
  decodeProxySession,
  buildProxyRequestHeaders,
  type ProxySession,
} from './proxy-session'

const session: ProxySession = {
  token: { uid: 'u1', email: 'u1@example.com' } as ProxySession['token'],
  profile: {
    name: '営業太郎',
    admin: false,
    rd: false,
    sales: true,
    accounting: false,
    tokushima: false,
    order: false,
  },
}

describe('encodeProxySession / decodeProxySession', () => {
  it('エンコードした値をデコードすると元に戻る (日本語の名前も保つ)', () => {
    expect(decodeProxySession(encodeProxySession(session))).toEqual(session)
  })

  it('エンコード結果は HTTP ヘッダに載せられる ASCII のみ', () => {
    expect(encodeProxySession(session)).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('ヘッダが無ければ null', () => {
    expect(decodeProxySession(null)).toBeNull()
  })

  it('壊れた値は null (例外を投げない)', () => {
    expect(decodeProxySession('not-base64!!')).toBeNull()
    expect(decodeProxySession(Buffer.from('{"foo":1}').toString('base64url'))).toBeNull()
  })

  it('uid を持たない値は null', () => {
    const bad = Buffer.from(JSON.stringify({ token: {}, profile: {} })).toString('base64url')
    expect(decodeProxySession(bad)).toBeNull()
  })
})

describe('buildProxyRequestHeaders', () => {
  it('クライアントが送ってきた同名ヘッダは常に捨てる (偽装防止)', () => {
    const incoming = new Headers({ cookie: 'a=b', [PROXY_SESSION_HEADER]: 'spoofed' })
    const out = buildProxyRequestHeaders(incoming, null)
    expect(out.get(PROXY_SESSION_HEADER)).toBeNull()
    expect(out.get('cookie')).toBe('a=b')
  })

  it('検証済みセッションがあれば上書きして載せる', () => {
    const incoming = new Headers({ [PROXY_SESSION_HEADER]: 'spoofed' })
    const out = buildProxyRequestHeaders(incoming, session)
    expect(decodeProxySession(out.get(PROXY_SESSION_HEADER))).toEqual(session)
  })

  it('元の Headers は変更しない', () => {
    const incoming = new Headers({ cookie: 'a=b' })
    buildProxyRequestHeaders(incoming, session)
    expect(incoming.get(PROXY_SESSION_HEADER)).toBeNull()
  })
})
