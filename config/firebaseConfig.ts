// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyC8r_TLGYkDhkl3bLZ1UnzN60VVDAG6i8s",
  authDomain: "yatrasetu-742a0.firebaseapp.com",
  projectId: "yatrasetu-742a0",
  storageBucket: "yatrasetu-742a0.firebasestorage.app",
  messagingSenderId: "86821760990",
  appId: "1:86821760990:web:d4f974c6db4e9c07dc774f",
  measurementId: "G-GZL7QMHCTS",
};

// Initialize Firebase App singleton
export const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth, Firestore Database, and Cloud Storage
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Analytics only in browser environment
export let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}