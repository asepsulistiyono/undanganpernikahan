import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA7dq1EtqqC_P-ekh0jniZU9o6Kw11bYog",
  authDomain: "wedding-invitation-992d7.firebaseapp.com",
  projectId: "wedding-invitation-992d7",
  storageBucket: "wedding-invitation-992d7.firebasestorage.app",
  messagingSenderId: "734364565804",
  appId: "1:734364565804:web:2d53f0cb30dfae12452c89"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
