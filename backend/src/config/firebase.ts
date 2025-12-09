import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    // firebase-admin expects the service account keys with these exact property names
    const serviceAccount = {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: privateKey,
    } as unknown as admin.ServiceAccount;

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize Firebase Admin:', err);
    throw err;
  }
}

export const auth = admin.auth();
export const firestore = admin.firestore();
