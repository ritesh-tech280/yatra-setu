"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebaseConfig";
import type { UserProfile, UserRole } from "@/types/yatra";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isOrganizer: boolean;
  isSahayak: boolean;
  login: (email: string, pass?: string) => Promise<UserProfile>;
  register: (name: string, email: string, pass: string, role?: UserRole, phone?: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  setUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = "yatrasetu_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Synchronize with Firebase Auth state
  useEffect(() => {
    // 1. Initial check from localStorage for fast load
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        }
      }
    }

    // 2. Listen to real-time Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch additional profile fields from Firestore users/{uid}
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          let phone = "";
          let name = firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User";
          let role: UserRole | undefined = undefined;

          if (userDoc.exists()) {
            const data = userDoc.data() as Partial<UserProfile>;
            phone = data.phone || "";
            if (data.name) name = data.name;
            if (data.role) role = data.role;
          }

          const profile: UserProfile = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            name,
            email: firebaseUser.email || "",
            phone,
            role,
            createdAt: new Date().toISOString(),
          };

          setUser(profile);
          if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
          }
        } catch (err) {
          console.warn("Error fetching user profile doc from Firestore:", err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveUserSession = (profile: UserProfile | null) => {
    setUser(profile);
    if (typeof window !== "undefined") {
      if (profile) {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      }
    }
  };

  const login = async (email: string, pass?: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      // Real Firebase Authentication Sign In
      const userCredential = await signInWithEmailAndPassword(auth, email, pass || "password123");
      const firebaseUser = userCredential.user;

      let phone = "";
      let name = firebaseUser.displayName || email.split("@")[0];
      let role: UserRole | undefined = undefined;

      try {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as Partial<UserProfile>;
          if (data.phone) phone = data.phone;
          if (data.name) name = data.name;
          if (data.role) role = data.role;
        }
      } catch (e) {
        console.warn("Firestore get user profile warning:", e);
      }

      const profile: UserProfile = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name,
        email: firebaseUser.email || email,
        phone,
        role,
        createdAt: new Date().toISOString(),
      };

      saveUserSession(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    role?: UserRole,
    phone?: string
  ): Promise<UserProfile> => {
    setLoading(true);
    try {
      // 1. Create User in Firebase Authentication Console
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass || "password123");
      const firebaseUser = userCredential.user;

      // 2. Set Firebase Auth Display Name
      await updateProfile(firebaseUser, { displayName: name });

      const now = new Date().toISOString();
      const userProfile: UserProfile = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || "",
        role: role || "organizer",
        createdAt: now,
      };

      // 3. Save User Document directly in Firebase Firestore 'users' collection (without global role requirement)
      try {
        await setDoc(doc(db, "users", firebaseUser.uid), {
          uid: firebaseUser.uid,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone?.trim() || "",
          createdAt: now,
          updatedAt: now,
        });
      } catch (err) {
        console.warn("Warning saving user document to Firestore:", err);
      }

      saveUserSession(userProfile);
      return userProfile;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("SignOut warning:", e);
    }
    saveUserSession(null);
  };

  const setUserRole = (role: UserRole) => {
    if (!user) return;
    const updated = { ...user, role };
    saveUserSession(updated);
  };

  const isOrganizer = user?.role === "organizer";
  const isSahayak = user?.role === "sahayak";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isOrganizer,
        isSahayak,
        login,
        register,
        logout,
        setUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
