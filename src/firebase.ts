import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { doc, getDoc, setDoc, onSnapshot, collection, query, orderBy, limit, serverTimestamp };

// Auth no-ops — app is now public
export const auth = null;
export const onAuthStateChanged = () => () => {};
export const signOut = async () => {};
export const GoogleAuthProvider = class {};
export const signInWithPopup = async () => ({ user: null });

export const handleFirestoreError = (error: any, operation: string, path: string) => {
  console.error(`Firestore ${operation} error at ${path}:`, error);
};

export enum FirestoreOperation {
  GET = 'GET', SET = 'SET', UPDATE = 'UPDATE', DELETE = 'DELETE',
}