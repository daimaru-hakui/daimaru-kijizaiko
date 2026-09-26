import type { DecodedIdToken } from 'firebase-admin/auth'

/**
 * proxy.ts が検証したセッションを下流 (layout / page / Server Action) に渡すための
 * リクエストヘッダ。proxy は毎リクエストこのヘッダを削除してから付け直すので、
 * クライアントが同名ヘッダを送っても偽装はできない。
 *
 * これにより 1 リクエストあたりの verifySessionCookie(checkRevoked) と
 * users/{uid} の読み込みが proxy の 1 回だけになる。
 */
export const PROXY_SESSION_HEADER = 'x-kijizaiko-session'

/** users ドキュメントのうち画面の出し分けに使う部分 */
export type ProxyUserProfile = {
  name: string
  admin: boolean
  rd: boolean
  sales: boolean
  accounting: boolean
  tokushima: boolean
  order: boolean
}

export type ProxySession = {
  token: DecodedIdToken
  profile: ProxyUserProfile
}

export function toProxyUserProfile(data: Record<string, unknown>): ProxyUserProfile {
  return {
    name: typeof data.name === 'string' ? data.name : '',
    admin: data.admin === true,
    rd: data.rd === true,
    sales: data.sales === true,
    accounting: data.accounting === true,
    tokushima: data.tokushima === true,
    order: data.order === true,
  }
}

/** HTTP ヘッダは ASCII 限定なので、JSON を base64url で包む */
export function encodeProxySession(session: ProxySession): string {
  return Buffer.from(JSON.stringify(session), 'utf8').toString('base64url')
}

export function decodeProxySession(value: string | null | undefined): ProxySession | null {
  if (!value) return null
  try {
    const parsed: unknown = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'))
    if (!isProxySession(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

function isProxySession(v: unknown): v is ProxySession {
  if (typeof v !== 'object' || v === null) return false
  const { token, profile } = v as Record<string, unknown>
  if (typeof token !== 'object' || token === null) return false
  if (typeof (token as Record<string, unknown>).uid !== 'string') return false
  return typeof profile === 'object' && profile !== null
}

/**
 * 下流に転送するリクエストヘッダを組み立てる。
 * クライアント由来の同名ヘッダは必ず捨て、検証済みセッションがあるときだけ付ける。
 */
export function buildProxyRequestHeaders(
  incoming: Headers,
  session: ProxySession | null,
): Headers {
  const headers = new Headers(incoming)
  headers.delete(PROXY_SESSION_HEADER)
  if (session) headers.set(PROXY_SESSION_HEADER, encodeProxySession(session))
  return headers
}
