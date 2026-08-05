// api/_lib/firebase.ts
// Firebase STUB — removed firebase-admin dependency in 2026-08-04.
// The DB calls (trends, volume, brief context, news cache) are no
// longer supported. All callers now soft-fail to empty arrays / null
// so the UI handles them gracefully.
//
// If Firebase is needed in the future, replace this stub with a real
// firebase-admin initialization + getFirestore().

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
export const admin: any = {
  apps: [],
  initializeApp: () => {},
  credential: { cert: () => ({}) },
  firestore: {
    Timestamp: { now: () => ({}), fromDate: () => ({}) },
    FieldValue: { serverTimestamp: () => ({}) },
  },
};
