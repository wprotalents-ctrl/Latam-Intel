import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: "ai-studio-applet-webapp-b5093",
    });
  } else {
    // Fallback for local dev with ADC
    admin.initializeApp({ projectId: "ai-studio-applet-webapp-b5093" });
  }
}

export const db = getFirestore(admin.app(), "ai-studio-98e74f83-a378-445d-baa9-3c954d2762c7");
export { admin };
