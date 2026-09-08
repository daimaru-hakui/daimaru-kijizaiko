import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { readFileSync } from 'fs'
import { resolve } from 'path'

let testEnv: RulesTestEnvironment | null = null

export async function setupFirestoreEmulator(): Promise<RulesTestEnvironment> {
  testEnv = await initializeTestEnvironment({
    projectId: 'daimaru-kijizaiko-test',
    firestore: {
      host: 'localhost',
      port: 8080,
      rules: readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8'),
    },
  })
  return testEnv
}

export async function teardownFirestoreEmulator(): Promise<void> {
  if (testEnv) {
    await testEnv.cleanup()
    testEnv = null
  }
}
