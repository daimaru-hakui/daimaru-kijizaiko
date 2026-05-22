import { describe, it, expect, vi } from 'vitest'

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

describe('firebase client', () => {
  it('auth / db / storage をエクスポートする', async () => {
    const client = await import('./client')
    expect(client.auth).toBeDefined()
    expect(client.db).toBeDefined()
    expect(client.storage).toBeDefined()
  })
})
