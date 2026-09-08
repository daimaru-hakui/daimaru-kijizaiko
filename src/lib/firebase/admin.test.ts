import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('firebase-admin/app', () => {
  const instance = { name: '[DEFAULT]' }
  return {
    initializeApp: vi.fn(() => instance),
    cert: vi.fn((v) => v),
    getApps: vi.fn(() => []),
    getApp: vi.fn(() => instance),
  }
})

vi.mock('firebase-admin/firestore', () => {
  const instance = { _type: 'firestore' }
  return { getFirestore: vi.fn(() => instance) }
})

vi.mock('firebase-admin/auth', () => {
  const instance = { _type: 'auth' }
  return { getAuth: vi.fn(() => instance) }
})

beforeEach(() => {
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY = JSON.stringify({ projectId: 'test-project' })
})

describe('getAdminDb', () => {
  it('同一インスタンスを返す', async () => {
    const { getAdminDb } = await import('./admin')
    expect(getAdminDb()).toBe(getAdminDb())
  })
})

describe('getAdminAuth', () => {
  it('同一インスタンスを返す', async () => {
    const { getAdminAuth } = await import('./admin')
    expect(getAdminAuth()).toBe(getAdminAuth())
  })
})
