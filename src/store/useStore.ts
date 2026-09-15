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
