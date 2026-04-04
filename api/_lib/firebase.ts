import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

if (!admin.apps.length) {
  admin.initializeApp({ projectId: "gen-lang-client-0410385668" });
}

export const db = getFirestore(
  admin.app(),
  "ai-studio-9279f702-e40c-457b-b350-29aa2957fe9a"
);
export { admin };
