import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "./config";
import type { UserProfile, UserRole } from "@/types/yatra";

const LOCAL_STORAGE_USER_KEY = "yatrasetu_current_user";

/**
 * Register a new user with Firebase Auth and store their profile in Firestore
 */
export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
  role: UserRole = "organizer",
  phone?: string
): Promise<UserProfile> {
  if (isFirebaseConfigured && auth && db) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    await updateProfile(firebaseUser, { displayName: name });

    const userProfile: UserProfile = {
      id: firebaseUser.uid,
      name,
      email,
      phone: phone || "",
      role,
      createdAt: new Date().toISOString(),
    };

    // Save profile in Firestore 'users' collection
    try {
      await setDoc(doc(db, "users", firebaseUser.uid), userProfile);
    } catch (e) {
      console.warn("Could not save to firestore users collection:", e);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userProfile));
    }

    return userProfile;
  }

  // Fallback local mode
  const localProfile: UserProfile = {
    id: `user-${Date.now()}`,
    name,
    email,
    phone: phone || "",
    role,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(localProfile));
  }

  return localProfile;
}

/**
 * Login existing user with Email and Password
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<UserProfile> {
  if (isFirebaseConfigured && auth && db) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Fetch user profile from firestore
    let role: UserRole = "organizer";
    let phone = "";
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as Partial<UserProfile>;
        role = data.role || "organizer";
        phone = data.phone || "";
      }
    } catch (e) {
      console.warn("Could not read user profile from firestore:", e);
    }

    const profile: UserProfile = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || email.split("@")[0],
      email: firebaseUser.email || email,
      phone,
      role,
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
    }

    return profile;
  }

  const profile: UserProfile = {
    id: `user-${Date.now()}`,
    name: email.split("@")[0],
    email,
    phone: "",
    role: "organizer",
    createdAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
  }
  return profile;
}

/**
 * Log out the current user
 */
export async function logout(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Firebase signout error:", e);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  }
}

/**
 * Get cached user from localStorage if any
 */
export function getStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}
