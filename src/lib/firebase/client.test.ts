import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check'

const mockApp = { name: '[DEFAULT]' }
const mockAuth = { _type: 'auth' }
const mockDb = { _type: 'firestore' }
const mockStorage = { _type: 'storage' }

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => mockApp),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => mockApp),
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockAuth),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => mockDb),
}))

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => mockStorage),
}))

vi.mock('firebase/app-check', () => ({
  initializeAppCheck: vi.fn(),
  ReCaptchaEnterpriseProvider: vi.fn(),
}))

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
})

afterEach(() => {
  vi.unstubAllEnvs()
  delete self.FIREBASE_APPCHECK_DEBUG_TOKEN
})

describe('firebase client', () => {
  it('auth / db / storage をエクスポートする', async () => {
    const client = await import('./client')
    expect(client.auth).toBeDefined()
    expect(client.db).toBeDefined()
    expect(client.storage).toBeDefined()
  })

  it('サイトキーがあるとき reCAPTCHA Enterprise で App Check を初期化する', async () => {
    vi.stubEnv('NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY', 'site-key')
    await import('./client')
    expect(ReCaptchaEnterpriseProvider).toHaveBeenCalledWith('site-key')
    expect(initializeAppCheck).toHaveBeenCalledWith(mockApp, {
      provider: expect.any(ReCaptchaEnterpriseProvider),
      isTokenAutoRefreshEnabled: true,
    })
  })

  it('サイトキーがないとき App Check を初期化しない', async () => {
    vi.stubEnv('NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY', '')
    await import('./client')
    expect(initializeAppCheck).not.toHaveBeenCalled()
  })

  it('デバッグトークンがあるとき FIREBASE_APPCHECK_DEBUG_TOKEN に設定する', async () => {
    vi.stubEnv('NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY', 'site-key')
    vi.stubEnv('NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN', 'debug-token')
    await import('./client')
    expect(self.FIREBASE_APPCHECK_DEBUG_TOKEN).toBe('debug-token')
  })
})
