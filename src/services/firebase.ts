// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validasi config (biar ketahuan kalau .env belum di-set)
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    '❌ Firebase config kosong! Pastikan file .env sudah dibuat di root proyek dengan prefix VITE_FIREBASE_*'
  );
}

console.log('🔍 Firebase config:', {
  apiKey: firebaseConfig.apiKey ? 'ADA' : '❌ KOSONG',
  projectId: firebaseConfig.projectId ? 'ADA' : '❌ KOSONG',
  appId: firebaseConfig.appId ? 'ADA' : '❌ KOSONG',
});

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
