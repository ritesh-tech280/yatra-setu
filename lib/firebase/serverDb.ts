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
} from "firebase/firestore";
import { db as serverDb } from "@/config/firebaseConfig";
import type { Yatra, Member, Payment, Expense, Sahayak, UserProfile } from "@/types/yatra";
import { DEMO_ORGANIZER } from "../constants";

// In-Memory Server Store
const globalStore = global as unknown as {
  __YATRA_STORE__?: {
    yatras: Yatra[];
    members: Member[];
    payments: Payment[];
    expenses: Expense[];
    sahayaks: Sahayak[];
    users: UserProfile[];
  };
};

if (!globalStore.__YATRA_STORE__) {
  globalStore.__YATRA_STORE__ = {
    yatras: [],
    members: [],
    payments: [],
    expenses: [],
    sahayaks: [],
    users: [DEMO_ORGANIZER],
  };
}

const memoryStore = globalStore.__YATRA_STORE__;

// ---------------- YATRAS ----------------
export async function getDbYatras(userId?: string): Promise<Yatra[]> {
  if (serverDb) {
    try {
      const col = collection(serverDb, "yatras");
      const q = userId ? query(col, where("organizerId", "==", userId)) : col;
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Yatra));
      }
    } catch (e) {
      console.warn("Firestore getDbYatras fallback:", e);
    }
  }
  return memoryStore.yatras;
}

export async function getDbYatraById(id: string): Promise<Yatra | null> {
  if (serverDb) {
    try {
      const snap = await getDoc(doc(serverDb, "yatras", id));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Yatra;
      }
    } catch (e) {
      console.warn("Firestore getDbYatraById fallback:", e);
    }
  }
  return memoryStore.yatras.find((y) => y.id === id) || null;
}

export async function createDbYatra(data: Omit<Yatra, "id" | "createdAt" | "updatedAt">): Promise<Yatra> {
  const id = `yatra-${Date.now()}`;
  const now = new Date().toISOString();
  const newYatra: Yatra = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  if (serverDb) {
    try {
      await setDoc(doc(serverDb, "yatras", id), newYatra);
    } catch (e) {
      console.warn("Firestore createDbYatra fallback:", e);
    }
  }
  memoryStore.yatras.unshift(newYatra);
  return newYatra;
}

export async function updateDbYatra(id: string, updates: Partial<Yatra>): Promise<Yatra | null> {
  const now = new Date().toISOString();
  if (serverDb) {
    try {
      await updateDoc(doc(serverDb, "yatras", id), { ...updates, updatedAt: now });
    } catch (e) {
      console.warn("Firestore updateDbYatra fallback:", e);
    }
  }
  const idx = memoryStore.yatras.findIndex((y) => y.id === id);
  if (idx !== -1) {
    memoryStore.yatras[idx] = { ...memoryStore.yatras[idx], ...updates, updatedAt: now };
    return memoryStore.yatras[idx];
  }
  return null;
}

export async function deleteDbYatra(id: string): Promise<boolean> {
  if (serverDb) {
    try {
      await deleteDoc(doc(serverDb, "yatras", id));
    } catch (e) {
      console.warn("Firestore deleteDbYatra fallback:", e);
    }
  }
  memoryStore.yatras = memoryStore.yatras.filter((y) => y.id !== id);
  memoryStore.members = memoryStore.members.filter((m) => m.yatraId !== id);
  memoryStore.payments = memoryStore.payments.filter((p) => p.yatraId !== id);
  memoryStore.expenses = memoryStore.expenses.filter((e) => e.yatraId !== id);
  memoryStore.sahayaks = memoryStore.sahayaks.filter((s) => s.yatraId !== id);
  return true;
}

// ---------------- MEMBERS (Nested: yatras/{yatraId}/members) ----------------
export async function getDbMembers(yatraId: string): Promise<Member[]> {
  if (serverDb && yatraId) {
    try {
      const snap = await getDocs(collection(serverDb, "yatras", yatraId, "members"));
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Member));
      }
    } catch (e) {
      console.warn("Firestore getDbMembers fallback:", e);
    }
  }
  return memoryStore.members.filter((m) => m.yatraId === yatraId);
}

export async function createDbMember(data: Omit<Member, "id" | "createdAt" | "updatedAt">): Promise<Member> {
  const id = `member-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();
  const newMember: Member = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  if (serverDb && data.yatraId) {
    try {
      await setDoc(doc(serverDb, "yatras", data.yatraId, "members", id), newMember);
    } catch (e) {
      console.warn("Firestore createDbMember fallback:", e);
    }
  }
  memoryStore.members.unshift(newMember);
  return newMember;
}

export async function updateDbMember(id: string, updates: Partial<Member>, yatraId?: string): Promise<Member | null> {
  const now = new Date().toISOString();
  const current = memoryStore.members.find((m) => m.id === id);
  const actualYatraId = yatraId || current?.yatraId;

  if (serverDb && actualYatraId) {
    try {
      await updateDoc(doc(serverDb, "yatras", actualYatraId, "members", id), { ...updates, updatedAt: now });
    } catch (e) {
      console.warn("Firestore updateDbMember fallback:", e);
    }
  }
  const idx = memoryStore.members.findIndex((m) => m.id === id);
  if (idx !== -1) {
    memoryStore.members[idx] = { ...memoryStore.members[idx], ...updates, updatedAt: now };
    return memoryStore.members[idx];
  }
  return null;
}

export async function deleteDbMember(id: string, yatraId?: string): Promise<boolean> {
  const current = memoryStore.members.find((m) => m.id === id);
  const actualYatraId = yatraId || current?.yatraId;

  if (serverDb && actualYatraId) {
    try {
      await deleteDoc(doc(serverDb, "yatras", actualYatraId, "members", id));
    } catch (e) {
      console.warn("Firestore deleteDbMember fallback:", e);
    }
  }
  memoryStore.members = memoryStore.members.filter((m) => m.id !== id);
  memoryStore.payments = memoryStore.payments.filter((p) => p.memberId !== id);
  return true;
}

// ---------------- PAYMENTS (Nested: yatras/{yatraId}/payments) ----------------
export async function getDbPayments(yatraId: string): Promise<Payment[]> {
  if (serverDb && yatraId) {
    try {
      const snap = await getDocs(collection(serverDb, "yatras", yatraId, "payments"));
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Payment));
      }
    } catch (e) {
      console.warn("Firestore getDbPayments fallback:", e);
    }
  }
  return memoryStore.payments.filter((p) => p.yatraId === yatraId);
}

export async function createDbPayment(data: Omit<Payment, "id" | "createdAt">): Promise<Payment> {
  const id = `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();
  const newPayment: Payment = {
    ...data,
    id,
    createdAt: now,
  };

  if (serverDb && data.yatraId) {
    try {
      await setDoc(doc(serverDb, "yatras", data.yatraId, "payments", id), newPayment);
    } catch (e) {
      console.warn("Firestore createDbPayment fallback:", e);
    }
  }
  memoryStore.payments.unshift(newPayment);
  return newPayment;
}

export async function deleteDbPayment(id: string, yatraId?: string): Promise<boolean> {
  const current = memoryStore.payments.find((p) => p.id === id);
  const actualYatraId = yatraId || current?.yatraId;

  if (serverDb && actualYatraId) {
    try {
      await deleteDoc(doc(serverDb, "yatras", actualYatraId, "payments", id));
    } catch (e) {
      console.warn("Firestore deleteDbPayment fallback:", e);
    }
  }
  memoryStore.payments = memoryStore.payments.filter((p) => p.id !== id);
  return true;
}

// ---------------- EXPENSES (Nested: yatras/{yatraId}/expenses) ----------------
export async function getDbExpenses(yatraId: string): Promise<Expense[]> {
  if (serverDb && yatraId) {
    try {
      const snap = await getDocs(collection(serverDb, "yatras", yatraId, "expenses"));
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
      }
    } catch (e) {
      console.warn("Firestore getDbExpenses fallback:", e);
    }
  }
  return memoryStore.expenses.filter((e) => e.yatraId === yatraId);
}

export async function createDbExpense(data: Omit<Expense, "id" | "createdAt" | "updatedAt">): Promise<Expense> {
  const id = `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();
  const newExpense: Expense = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  if (serverDb && data.yatraId) {
    try {
      await setDoc(doc(serverDb, "yatras", data.yatraId, "expenses", id), newExpense);
    } catch (e) {
      console.warn("Firestore createDbExpense fallback:", e);
    }
  }
  memoryStore.expenses.unshift(newExpense);
  return newExpense;
}

export async function updateDbExpense(id: string, updates: Partial<Expense>, yatraId?: string): Promise<Expense | null> {
  const now = new Date().toISOString();
  const current = memoryStore.expenses.find((e) => e.id === id);
  const actualYatraId = yatraId || current?.yatraId;

  if (serverDb && actualYatraId) {
    try {
      await updateDoc(doc(serverDb, "yatras", actualYatraId, "expenses", id), { ...updates, updatedAt: now });
    } catch (e) {
      console.warn("Firestore updateDbExpense fallback:", e);
    }
  }
  const idx = memoryStore.expenses.findIndex((e) => e.id === id);
  if (idx !== -1) {
    memoryStore.expenses[idx] = { ...memoryStore.expenses[idx], ...updates, updatedAt: now };
    return memoryStore.expenses[idx];
  }
  return null;
}

export async function deleteDbExpense(id: string, yatraId?: string): Promise<boolean> {
  const current = memoryStore.expenses.find((e) => e.id === id);
  const actualYatraId = yatraId || current?.yatraId;

  if (serverDb && actualYatraId) {
    try {
      await deleteDoc(doc(serverDb, "yatras", actualYatraId, "expenses", id));
    } catch (e) {
      console.warn("Firestore deleteDbExpense fallback:", e);
    }
  }
  memoryStore.expenses = memoryStore.expenses.filter((e) => e.id !== id);
  return true;
}

// ---------------- SAHAYAKS / STAFF (Nested: yatras/{yatraId}/staff) ----------------
export async function getDbSahayaks(yatraId: string): Promise<Sahayak[]> {
  if (serverDb && yatraId) {
    try {
      const snap = await getDocs(collection(serverDb, "yatras", yatraId, "staff"));
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Sahayak));
      }
    } catch (e) {
      console.warn("Firestore getDbSahayaks fallback:", e);
    }
  }
  return memoryStore.sahayaks.filter((s) => s.yatraId === yatraId);
}

export async function createDbSahayak(data: {
  yatraId: string;
  uid?: string;
  name?: string;
  phone?: string;
  email?: string;
  memberId?: string;
  role?: "sahayak";
  status?: "active" | "inactive";
  addedBy?: string;
}): Promise<Sahayak> {
  const staffUid = data.uid || `staff-${Date.now()}`;
  const now = new Date().toISOString();
  const newSahayak: Sahayak = {
    id: staffUid,
    uid: staffUid,
    yatraId: data.yatraId,
    role: data.role || "sahayak",
    status: data.status || "active",
    name: data.name,
    phone: data.phone,
    email: data.email,
    memberId: data.memberId,
    createdAt: now,
    addedAt: now,
    addedBy: data.addedBy || "org-1",
  };

  if (serverDb && data.yatraId) {
    try {
      await setDoc(doc(serverDb, "yatras", data.yatraId, "staff", staffUid), newSahayak);
    } catch (e) {
      console.warn("Firestore createDbSahayak fallback:", e);
    }
  }
  memoryStore.sahayaks.unshift(newSahayak);
  return newSahayak;
}

export async function deleteDbSahayak(id: string, yatraId?: string): Promise<boolean> {
  const current = memoryStore.sahayaks.find((s) => s.id === id);
  const actualYatraId = yatraId || current?.yatraId;

  if (serverDb && actualYatraId) {
    try {
      await deleteDoc(doc(serverDb, "yatras", actualYatraId, "staff", id));
    } catch (e) {
      console.warn("Firestore deleteDbSahayak fallback:", e);
    }
  }
  memoryStore.sahayaks = memoryStore.sahayaks.filter((s) => s.id !== id);
  return true;
}

// ---------------- USERS / AUTH ----------------
export async function findDbUserByEmail(email: string): Promise<UserProfile | null> {
  const user = memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  return user || null;
}

export async function createDbUser(user: UserProfile): Promise<UserProfile> {
  if (serverDb) {
    try {
      await setDoc(doc(serverDb, "users", user.id), user);
    } catch (e) {
      console.warn("Firestore createDbUser fallback:", e);
    }
  }
  memoryStore.users.push(user);
  return user;
}
