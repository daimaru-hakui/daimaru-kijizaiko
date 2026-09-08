import { App, initializeApp, getApps, getApp, cert } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { getAuth, Auth } from 'firebase-admin/auth'

function getAdminApp(): App {
  if (getApps().length > 0) return getApp()
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!)
  return initializeApp({ credential: cert(serviceAccount) })
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp())
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp())
}
