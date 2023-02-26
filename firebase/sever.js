const admin = require('firebase-admin');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

if (admin.apps.length === 0) {
  initializeApp({
    credential: cert(JSON.parse(serviceAccount))
  });
}

export const db = getFirestore();