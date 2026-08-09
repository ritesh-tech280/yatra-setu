import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db, auth, isFirebaseConfigured } from "./config";
import type {
  Yatra,
  Member,
  Payment,
  Expense,
  YatraStaff,
  Sahayak,
  YatraRole,
} from "@/types/yatra";

// Local storage fallback keys
const LS_KEYS = {
  YATRAS: "yatrasetu_yatras",
  MEMBERS: "yatrasetu_members",
  PAYMENTS: "yatrasetu_payments",
  EXPENSES: "yatrasetu_expenses",
  SAHAYAKS: "yatrasetu_sahayaks",
};

function getLocal<T>(key: string, fallback: T[] = []): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T[];
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

// ---------------- ROLE RESOLUTION ----------------

/**
 * Determine a user's role for a specific Yatra
 * 1. If currentUser.uid === yatra.organizerId -> "organizer"
 * 2. If yatras/{yatraId}/staff/{currentUser.uid} exists, role === "sahayak", and status === "active" -> "sahayak"
 * 3. Otherwise -> "no_access"
 */
export async function getYatraRole(yatraId?: string, uid?: string): Promise<YatraRole> {
  if (!yatraId || !uid) return "no_access";

  // Demo user check
  if (uid === "org-1") return "organizer";
  if (uid === "sahayak-1") return "sahayak";

  if (isFirebaseConfigured && db) {
    try {
      // Step 1: Check Yatra Document
      const yatraSnap = await getDoc(doc(db, "yatras", yatraId));
      if (yatraSnap.exists()) {
        const yatraData = yatraSnap.data() as Yatra;
        if (yatraData.organizerId === uid) {
          return "organizer";
        }
      }

      // Step 2: Check Staff Subcollection
      const staffSnap = await getDoc(doc(db, "yatras", yatraId, "staff", uid));
      if (staffSnap.exists()) {
        const staffData = staffSnap.data() as YatraStaff;
        if (staffData.role === "sahayak" && staffData.status === "active") {
          return "sahayak";
        }
      }

      return "no_access";
    } catch (e) {
      console.warn("Error resolving Yatra role:", e);
    }
  }

  // Local storage fallback
  const yatras = getLocal<Yatra>(LS_KEYS.YATRAS, []);
  const yatra = yatras.find((y) => y.id === yatraId);
  if (yatra && (yatra.organizerId === uid || uid.startsWith("org-"))) return "organizer";

  const sahayaks = getLocal<YatraStaff>(LS_KEYS.SAHAYAKS, []);
  const sahayak = sahayaks.find(
    (s) => s.yatraId === yatraId && (s.uid === uid || s.id === uid) && s.status === "active"
  );
  if (sahayak || uid.startsWith("sahayak-")) return "sahayak";

  return "no_access";
}

// ---------------- YATRA CRUD (Root: yatras/{yatraId}) ----------------

export async function fetchYatras(_userId?: string): Promise<Yatra[]> {
  if (isFirebaseConfigured && db) {
    try {
      const col = collection(db, "yatras");
      const snap = await getDocs(col);
      const list: Yatra[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Yatra));
      if (list.length > 0) {
        return list;
      }
    } catch (e) {
      console.warn("Firestore fetchYatras error, using local storage:", e);
    }
  }
  return getLocal<Yatra>(LS_KEYS.YATRAS, []);
}

export function listenToYatras(callback: (yatras: Yatra[]) => void): Unsubscribe | null {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const col = collection(db, "yatras");
    return onSnapshot(
      col,
      (snap) => {
        const list: Yatra[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Yatra));
        callback(list);
      },
      (err) => {
        console.warn("Real-time yatras error:", err);
      }
    );
  } catch (e) {
    console.warn("Failed to listen to yatras:", e);
    return null;
  }
}

export async function saveYatra(yatraData: Omit<Yatra, "id" | "createdAt" | "updatedAt">): Promise<Yatra> {
  const now = new Date().toISOString();
  const id = `yatra-${Date.now()}`;
  
  // Use currently authenticated user's UID as organizerId
  const currentUid = auth?.currentUser?.uid || yatraData.organizerId || "org-1";

  const newYatra: Yatra = {
    ...yatraData,
    id,
    organizerId: currentUid,
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "yatras", id);
      await setDoc(docRef, newYatra);
      const existing = getLocal<Yatra>(LS_KEYS.YATRAS, []);
      setLocal(LS_KEYS.YATRAS, [newYatra, ...existing.filter((y) => y.id !== id)]);
      return newYatra;
    } catch (e) {
      console.warn("Firestore saveYatra error:", e);
    }
  }

  const existing = getLocal<Yatra>(LS_KEYS.YATRAS, []);
  setLocal(LS_KEYS.YATRAS, [newYatra, ...existing.filter((y) => y.id !== id)]);
  return newYatra;
}

export async function updateYatraDetails(yatraId: string, updates: Partial<Yatra>): Promise<void> {
  const now = new Date().toISOString();
  // Ensure organizerId cannot be altered
  const safeUpdates = { ...updates, updatedAt: now };
  delete (safeUpdates as any).organizerId;

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "yatras", yatraId);
      await updateDoc(docRef, safeUpdates);
    } catch (e) {
      console.warn("Firestore updateYatra error:", e);
    }
  }

  const existing = getLocal<Yatra>(LS_KEYS.YATRAS, []);
  const updated = existing.map((y) => (y.id === yatraId ? { ...y, ...safeUpdates } : y));
  setLocal(LS_KEYS.YATRAS, updated);
}

export async function deleteYatraFromDb(yatraId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "yatras", yatraId));
    } catch (e) {
      console.warn("Firestore deleteYatra error:", e);
    }
  }
  const existing = getLocal<Yatra>(LS_KEYS.YATRAS, []);
  setLocal(
    LS_KEYS.YATRAS,
    existing.filter((y) => y.id !== yatraId)
  );
}

// ---------------- MEMBER CRUD (Subcollection: yatras/{yatraId}/members) ----------------

export async function fetchMembers(yatraId: string): Promise<Member[]> {
  if (!yatraId) return [];
  if (isFirebaseConfigured && db) {
    try {
      const col = collection(db, "yatras", yatraId, "members");
      const snap = await getDocs(col);
      const list: Member[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Member));
      return list;
    } catch (e) {
      console.warn("Firestore fetchMembers error:", e);
    }
  }
  const all = getLocal<Member>(LS_KEYS.MEMBERS, []);
  return all.filter((m) => m.yatraId === yatraId);
}

export function listenToMembers(yatraId: string, callback: (members: Member[]) => void): Unsubscribe | null {
  if (!isFirebaseConfigured || !db || !yatraId) return null;
  try {
    const col = collection(db, "yatras", yatraId, "members");
    return onSnapshot(
      col,
      (snap) => {
        const list: Member[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Member));
        callback(list);
      },
      (err) => {
        console.warn("Real-time members error:", err);
      }
    );
  } catch (e) {
    console.warn("Failed to listen to members:", e);
    return null;
  }
}

export async function saveMember(memberData: Omit<Member, "id" | "createdAt">): Promise<Member> {
  const now = new Date().toISOString();
  const id = `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const newMember: Member = {
    ...memberData,
    id,
    createdAt: now,
  };

  if (isFirebaseConfigured && db && memberData.yatraId) {
    try {
      const docRef = doc(db, "yatras", memberData.yatraId, "members", id);
      await setDoc(docRef, newMember);
      const existing = getLocal<Member>(LS_KEYS.MEMBERS, []);
      setLocal(LS_KEYS.MEMBERS, [newMember, ...existing]);
      return newMember;
    } catch (e) {
      console.error("Firestore saveMember error:", e);
      throw e;
    }
  }

  const existing = getLocal<Member>(LS_KEYS.MEMBERS, []);
  setLocal(LS_KEYS.MEMBERS, [newMember, ...existing]);
  return newMember;
}

export async function updateMemberDetails(
  yatraId: string,
  memberId: string,
  updates: Partial<Member>
): Promise<void> {
  const now = new Date().toISOString();
  if (isFirebaseConfigured && db && yatraId) {
    try {
      const docRef = doc(db, "yatras", yatraId, "members", memberId);
      await updateDoc(docRef, { ...updates, updatedAt: now });
    } catch (e) {
      console.warn("Firestore updateMember error:", e);
    }
  }
  const existing = getLocal<Member>(LS_KEYS.MEMBERS, []);
  const updated = existing.map((m) => (m.id === memberId ? { ...m, ...updates, updatedAt: now } : m));
  setLocal(LS_KEYS.MEMBERS, updated);
}

export async function deleteMemberFromDb(yatraId: string, memberId: string): Promise<void> {
  if (isFirebaseConfigured && db && yatraId) {
    try {
      await deleteDoc(doc(db, "yatras", yatraId, "members", memberId));
    } catch (e) {
      console.warn("Firestore deleteMember error:", e);
    }
  }
  const existing = getLocal<Member>(LS_KEYS.MEMBERS, []);
  setLocal(
    LS_KEYS.MEMBERS,
    existing.filter((m) => m.id !== memberId)
  );
}

// ---------------- PAYMENT CRUD (Subcollection: yatras/{yatraId}/payments) ----------------

export async function fetchPayments(yatraId: string): Promise<Payment[]> {
  if (!yatraId) return [];
  if (isFirebaseConfigured && db) {
    try {
      const col = collection(db, "yatras", yatraId, "payments");
      const snap = await getDocs(col);
      const list: Payment[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Payment));
      return list;
    } catch (e) {
      console.warn("Firestore fetchPayments error:", e);
    }
  }
  const all = getLocal<Payment>(LS_KEYS.PAYMENTS, []);
  return all.filter((p) => p.yatraId === yatraId);
}

export function listenToPayments(yatraId: string, callback: (payments: Payment[]) => void): Unsubscribe | null {
  if (!isFirebaseConfigured || !db || !yatraId) return null;
  try {
    const col = collection(db, "yatras", yatraId, "payments");
    return onSnapshot(
      col,
      (snap) => {
        const list: Payment[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Payment));
        callback(list);
      },
      (err) => {
        console.warn("Real-time payments error:", err);
      }
    );
  } catch (e) {
    console.warn("Failed to listen to payments:", e);
    return null;
  }
}

export async function savePayment(paymentData: Omit<Payment, "id" | "createdAt">): Promise<Payment> {
  const now = new Date().toISOString();
  const id = `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const newPayment: Payment = {
    ...paymentData,
    id,
    createdAt: now,
  };

  if (isFirebaseConfigured && db && paymentData.yatraId) {
    try {
      const docRef = doc(db, "yatras", paymentData.yatraId, "payments", id);
      await setDoc(docRef, newPayment);
      const existing = getLocal<Payment>(LS_KEYS.PAYMENTS, []);
      setLocal(LS_KEYS.PAYMENTS, [newPayment, ...existing]);
      return newPayment;
    } catch (e) {
      console.error("Firestore savePayment error:", e);
      throw e;
    }
  }

  const existing = getLocal<Payment>(LS_KEYS.PAYMENTS, []);
  setLocal(LS_KEYS.PAYMENTS, [newPayment, ...existing]);
  return newPayment;
}

export async function deletePaymentFromDb(yatraId: string, paymentId: string): Promise<void> {
  if (isFirebaseConfigured && db && yatraId) {
    try {
      await deleteDoc(doc(db, "yatras", yatraId, "payments", paymentId));
    } catch (e) {
      console.warn("Firestore deletePayment error:", e);
    }
  }
  const existing = getLocal<Payment>(LS_KEYS.PAYMENTS, []);
  setLocal(
    LS_KEYS.PAYMENTS,
    existing.filter((p) => p.id !== paymentId)
  );
}

// ---------------- EXPENSE CRUD (Subcollection: yatras/{yatraId}/expenses) ----------------

export async function fetchExpenses(yatraId: string): Promise<Expense[]> {
  if (!yatraId) return [];
  if (isFirebaseConfigured && db) {
    try {
      const col = collection(db, "yatras", yatraId, "expenses");
      const snap = await getDocs(col);
      const list: Expense[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Expense));
      return list;
    } catch (e) {
      console.warn("Firestore fetchExpenses error:", e);
    }
  }
  const all = getLocal<Expense>(LS_KEYS.EXPENSES, []);
  return all.filter((e) => e.yatraId === yatraId);
}

export function listenToExpenses(yatraId: string, callback: (expenses: Expense[]) => void): Unsubscribe | null {
  if (!isFirebaseConfigured || !db || !yatraId) return null;
  try {
    const col = collection(db, "yatras", yatraId, "expenses");
    return onSnapshot(
      col,
      (snap) => {
        const list: Expense[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Expense));
        callback(list);
      },
      (err) => {
        console.warn("Real-time expenses error:", err);
      }
    );
  } catch (e) {
    console.warn("Failed to listen to expenses:", e);
    return null;
  }
}

export async function saveExpense(expenseData: Omit<Expense, "id" | "createdAt">): Promise<Expense> {
  const now = new Date().toISOString();
  const id = `e-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const newExpense: Expense = {
    ...expenseData,
    id,
    createdAt: now,
  };

  if (isFirebaseConfigured && db && expenseData.yatraId) {
    try {
      const docRef = doc(db, "yatras", expenseData.yatraId, "expenses", id);
      await setDoc(docRef, newExpense);
      const existing = getLocal<Expense>(LS_KEYS.EXPENSES, []);
      setLocal(LS_KEYS.EXPENSES, [newExpense, ...existing]);
      return newExpense;
    } catch (e) {
      console.error("Firestore saveExpense error:", e);
      throw e;
    }
  }

  const existing = getLocal<Expense>(LS_KEYS.EXPENSES, []);
  setLocal(LS_KEYS.EXPENSES, [newExpense, ...existing]);
  return newExpense;
}

export async function updateExpenseDetails(
  yatraId: string,
  expenseId: string,
  updates: Partial<Expense>
): Promise<void> {
  const now = new Date().toISOString();
  if (isFirebaseConfigured && db && yatraId) {
    try {
      const docRef = doc(db, "yatras", yatraId, "expenses", expenseId);
      await updateDoc(docRef, { ...updates, updatedAt: now });
    } catch (e) {
      console.warn("Firestore updateExpense error:", e);
    }
  }
  const existing = getLocal<Expense>(LS_KEYS.EXPENSES, []);
  const updated = existing.map((e) => (e.id === expenseId ? { ...e, ...updates, updatedAt: now } : e));
  setLocal(LS_KEYS.EXPENSES, updated);
}

export async function deleteExpenseFromDb(yatraId: string, expenseId: string): Promise<void> {
  if (isFirebaseConfigured && db && yatraId) {
    try {
      await deleteDoc(doc(db, "yatras", yatraId, "expenses", expenseId));
    } catch (e) {
      console.warn("Firestore deleteExpense error:", e);
    }
  }
  const existing = getLocal<Expense>(LS_KEYS.EXPENSES, []);
  setLocal(
    LS_KEYS.EXPENSES,
    existing.filter((e) => e.id !== expenseId)
  );
}

// ---------------- SAHAYAKS / STAFF CRUD (Subcollection: yatras/{yatraId}/staff/{uid}) ----------------

export async function fetchSahayaks(yatraId: string): Promise<YatraStaff[]> {
  if (!yatraId) return [];
  if (isFirebaseConfigured && db) {
    try {
      const col = collection(db, "yatras", yatraId, "staff");
      const snap = await getDocs(col);
      const list: YatraStaff[] = [];
      snap.forEach((d) => list.push({ id: d.id, uid: d.id, ...d.data() } as YatraStaff));
      return list;
    } catch (e) {
      console.warn("Firestore fetchSahayaks error:", e);
    }
  }
  const all = getLocal<YatraStaff>(LS_KEYS.SAHAYAKS, []);
  return all.filter((s) => s.yatraId === yatraId);
}

export function listenToSahayaks(yatraId: string, callback: (sahayaks: YatraStaff[]) => void): Unsubscribe | null {
  if (!isFirebaseConfigured || !db || !yatraId) return null;
  try {
    const col = collection(db, "yatras", yatraId, "staff");
    return onSnapshot(
      col,
      (snap) => {
        const list: YatraStaff[] = [];
        snap.forEach((d) => list.push({ id: d.id, uid: d.id, ...d.data() } as YatraStaff));
        callback(list);
      },
      (err) => {
        console.warn("Real-time sahayaks error:", err);
      }
    );
  } catch (e) {
    console.warn("Failed to listen to sahayaks:", e);
    return null;
  }
}

/**
 * Add / Assign a Sahayak in yatras/{yatraId}/staff/{uid}
 * Document ID is the Sahayak's Firebase Authentication UID
 */
export async function addSahayak(
  yatraId: string,
  staffData: {
    uid: string;
    name?: string;
    phone?: string;
    email?: string;
    memberId?: string;
  }
): Promise<YatraStaff> {
  const now = new Date().toISOString();
  const staffUid = staffData.uid.trim();
  const currentUid = auth?.currentUser?.uid || "org-1";

  const newStaff: YatraStaff = {
    id: staffUid,
    uid: staffUid,
    yatraId,
    name: staffData.name?.trim() || "",
    phone: staffData.phone?.trim() || "",
    email: staffData.email?.trim() || "",
    memberId: staffData.memberId || "",
    role: "sahayak",
    status: "active",
    createdAt: now,
    joinedAt: now,
    addedAt: now,
    addedBy: currentUid,
  };

  if (isFirebaseConfigured && db && yatraId && staffUid) {
    try {
      const docRef = doc(db, "yatras", yatraId, "staff", staffUid);
      await setDoc(docRef, newStaff);
      const existing = getLocal<YatraStaff>(LS_KEYS.SAHAYAKS, []);
      setLocal(LS_KEYS.SAHAYAKS, [newStaff, ...existing.filter((s) => s.id !== staffUid)]);
      return newStaff;
    } catch (e) {
      console.error("Firestore addSahayak error:", e);
      throw e;
    }
  }

  const existing = getLocal<YatraStaff>(LS_KEYS.SAHAYAKS, []);
  setLocal(LS_KEYS.SAHAYAKS, [newStaff, ...existing.filter((s) => s.id !== staffUid)]);
  return newStaff;
}

// Alias for compatibility
export async function saveSahayak(
  sahayakData: Omit<Sahayak, "id" | "addedAt"> & { uid?: string }
): Promise<Sahayak> {
  const staffUid = sahayakData.uid || `sahayak-${Date.now()}`;
  return addSahayak(sahayakData.yatraId, {
    uid: staffUid,
    name: sahayakData.name,
    phone: sahayakData.phone,
    email: sahayakData.email,
  });
}

export async function removeSahayakFromDb(yatraId: string, sahayakUid: string): Promise<void> {
  if (isFirebaseConfigured && db && yatraId && sahayakUid) {
    try {
      await deleteDoc(doc(db, "yatras", yatraId, "staff", sahayakUid));
    } catch (e) {
      console.warn("Firestore deleteSahayak error:", e);
    }
  }
  const existing = getLocal<YatraStaff>(LS_KEYS.SAHAYAKS, []);
  setLocal(
    LS_KEYS.SAHAYAKS,
    existing.filter((s) => s.id !== sahayakUid && s.uid !== sahayakUid)
  );
}

/**
 * Reset local state
 */
export function resetDemoData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LS_KEYS.YATRAS);
    localStorage.removeItem(LS_KEYS.MEMBERS);
    localStorage.removeItem(LS_KEYS.PAYMENTS);
    localStorage.removeItem(LS_KEYS.EXPENSES);
    localStorage.removeItem(LS_KEYS.SAHAYAKS);
  }
}
