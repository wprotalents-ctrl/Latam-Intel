// src/firebase.ts
// Firebase STUB — removed firebase dependency in 2026-08-04.
// No auth, no Firestore calls. Replaced with no-op stubs so existing
// imports don't break. UI code that uses these will get null/empty
// results and handle them gracefully (e.g. trends/volume charts
// already gate behind length > 0).
//
// If Firebase is needed in the future, replace this with real
// initializeApp() + getFirestore() and install firebase + firebase-admin.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: any = {
  collection: () => ({
    orderBy: () => ({
      limit: () => ({
        get: async () => ({ docs: [], empty: true }),
      }),
    }),
    doc: () => ({
      get: async () => ({ exists: false, data: () => null }),
      set: async () => {},
    }),
    add: async () => ({ id: 'stub' }),
  }),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const doc: any = () => ({});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getDoc: any = async () => ({ exists: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getDocs: any = async () => ({ docs: [], empty: true, forEach: () => {} });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setDoc: any = async () => {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onSnapshot: any = () => () => {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const collection: any = () => ({});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const query: any = () => ({});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const orderBy: any = () => ({});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const limit: any = () => ({});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const where: any = () => ({});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const serverTimestamp: any = () => ({});

export const handleFirestoreError = (error: any, operation: string, path: string) => {
  // eslint-disable-next-line no-console
  console.warn(`Firestore stub: ${operation} at ${path} (no-op)`, error?.message || '');
};

export enum FirestoreOperation {
  GET = 'GET', SET = 'SET', UPDATE = 'UPDATE', DELETE = 'DELETE', WRITE = 'WRITE', LIST = 'LIST',
}
