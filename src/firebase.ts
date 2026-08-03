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



export const handleFirestoreError = (error: any, operation: string, path: string) => {
  console.error(`Firestore ${operation} error at ${path}:`, error);
};

export enum FirestoreOperation {
  GET = 'GET', SET = 'SET', UPDATE = 'UPDATE', DELETE = 'DELETE', WRITE = 'WRITE', LIST = 'LIST',
}