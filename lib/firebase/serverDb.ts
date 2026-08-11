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
import type { Yatra, Member, Payment, Expense, Sahayak, UserProfile, YatraInvitation } from "@/types/yatra";

export function cleanDocData<T extends Record<string, any>>(data: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

// In-Memory Server Store
const globalStore = global as unknown as {
  __YATRA_STORE__?: {
    yatras: Yatra[];
    members: Member[];
    payments: Payment[];
    expenses: Expense[];
    sahayaks: Sahayak[];
    users: UserProfile[];
    invitations: YatraInvitation[];
  };
};

if (!globalStore.__YATRA_STORE__) {
  globalStore.__YATRA_STORE__ = {
    yatras: [],
    members: [],
    payments: [],
    expenses: [],
    sahayaks: [],
    users: [],
    invitations: [],
  };
}

if (!globalStore.__YATRA_STORE__.invitations) {
  globalStore.__YATRA_STORE__.invitations = [];
}

const memoryStore = globalStore.__YATRA_STORE__;

// ---------------- YATRAS ----------------
export async function getDbYatras(userId?: string): Promise<Yatra[]> {
  let allYatras: Yatra[] = [];
  if (serverDb) {
    try {
      const col = collection(serverDb, "yatras");
      const snap = await getDocs(col);
      if (!snap.empty) {
        allYatras = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Yatra));
      }
    } catch (e) {
      console.warn("Firestore getDbYatras fallback:", e);
    }
  }
  if (allYatras.length === 0) {
    allYatras = memoryStore.yatras;
  }

  if (!userId) {
    return allYatras;
  }

  return allYatras.filter(
    (y) =>
      y.organizerId === userId ||
      (Array.isArray(y.sahayakIds) && y.sahayakIds.includes(userId)) ||
      memoryStore.sahayaks.some((s) => s.yatraId === y.id && (s.uid === userId || s.id === userId))
  );
}

export async function getDbYatraById(id: string): Promise<Yatra | null> {
  if (serverDb) {
    try {
      const d = await getDoc(doc(serverDb, "yatras", id));
      if (d.exists()) {
        return { id: d.id, ...d.data() } as Yatra;
      }
    } catch (e) {
      console.warn("Firestore getDbYatraById fallback:", e);
    }
  }
  return memoryStore.yatras.find((y) => y.id === id) || null;
}

export async function createDbYatra(data: Partial<Yatra>): Promise<Yatra> {
  const newId = data.id || `yatra_${Date.now()}`;
  const now = new Date().toISOString();
  const yatra: Yatra = {
    id: newId,
    name: data.name || "My Yatra",
    startPlace: data.startPlace || "",
    destination: data.destination || "",
    startDate: data.startDate || now.split("T")[0],
    endDate: data.endDate || now.split("T")[0],
    fare: Number(data.fare) || 0,
    organizerId: data.organizerId || "organizer",
    organizerName: data.organizerName || "Organizer",
    description: data.description || "",
    sahayakIds: data.sahayakIds || [],
    createdAt: now,
    updatedAt: now,
  };

  if (serverDb) {
    try {
      await setDoc(doc(serverDb, "yatras", newId), cleanDocData(yatra));
    } catch (e) {
      console.warn("Firestore createDbYatra fallback:", e);
    }
  }
  memoryStore.yatras.unshift(yatra);
  return yatra;
}

export async function updateDbYatra(id: string, data: Partial<Yatra>): Promise<Yatra | null> {
  const updatedData = { ...data, updatedAt: new Date().toISOString() };
  if (serverDb) {
    try {
      await updateDoc(doc(serverDb, "yatras", id), cleanDocData(updatedData));
    } catch (e) {
      console.warn("Firestore updateDbYatra fallback:", e);
    }
  }
  const idx = memoryStore.yatras.findIndex((y) => y.id === id);
  if (idx !== -1) {
    memoryStore.yatras[idx] = { ...memoryStore.yatras[idx], ...updatedData };
    return memoryStore.yatras[idx];
  }
  return null;
}

export async function deleteDbYatra(id: string): Promise<boolean> {
  if (serverDb) {
    try {
      const subcollections = ["members", "payments", "expenses", "staff", "invitations"];
      for (const sub of subcollections) {
        try {
          const subSnap = await getDocs(collection(serverDb, "yatras", id, sub));
          for (const d of subSnap.docs) {
            await deleteDoc(d.ref);
          }
        } catch {}
      }
      try {
        const invQuery = query(collection(serverDb, "invitations"), where("yatraId", "==", id));
        const invSnap = await getDocs(invQuery);
        for (const d of invSnap.docs) {
          await deleteDoc(d.ref);
        }
      } catch {}
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
  memoryStore.invitations = memoryStore.invitations.filter((i) => i.yatraId !== id);
  return true;
}

// ---------------- MEMBERS ----------------
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

export async function createDbMember(data: Partial<Member>): Promise<Member> {
  const newId = data.id || `mem_${Date.now()}`;
  const now = new Date().toISOString();
  const member: Member = {
    id: newId,
    yatraId: data.yatraId || "",
    name: data.name || "Member",
    phone: data.phone || "",
    address: data.address || "",
    notes: data.notes || "",
    createdAt: now,
    updatedAt: now,
  };

  if (serverDb && data.yatraId) {
    try {
      await setDoc(doc(serverDb, "yatras", data.yatraId, "members", newId), cleanDocData(member));
    } catch (e) {
      console.warn("Firestore createDbMember fallback:", e);
    }
  }
  memoryStore.members.unshift(member);
  return member;
}

export async function updateDbMember(id: string, data: Partial<Member>): Promise<Member | null> {
  const updatedData = { ...data, updatedAt: new Date().toISOString() };
  const current = memoryStore.members.find((m) => m.id === id);
  const yatraId = data.yatraId || current?.yatraId;

  if (serverDb && yatraId) {
    try {
      await updateDoc(doc(serverDb, "yatras", yatraId, "members", id), cleanDocData(updatedData));
    } catch (e) {
      console.warn("Firestore updateDbMember fallback:", e);
    }
  }
  const idx = memoryStore.members.findIndex((m) => m.id === id);
  if (idx !== -1) {
    memoryStore.members[idx] = { ...memoryStore.members[idx], ...updatedData };
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
      try {
        const pQuery = query(collection(serverDb, "yatras", actualYatraId, "payments"), where("memberId", "==", id));
        const pSnap = await getDocs(pQuery);
        for (const d of pSnap.docs) {
          await deleteDoc(d.ref);
        }
      } catch {}
    } catch (e) {
      console.warn("Firestore deleteDbMember fallback:", e);
    }
  }
  memoryStore.members = memoryStore.members.filter((m) => m.id !== id);
  memoryStore.payments = memoryStore.payments.filter((p) => p.memberId !== id);
  return true;
}

// ---------------- PAYMENTS ----------------
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

export async function createDbPayment(data: Partial<Payment>): Promise<Payment> {
  const newId = data.id || `pay_${Date.now()}`;
  const now = new Date().toISOString();
  const payment: Payment = {
    id: newId,
    yatraId: data.yatraId || "",
    memberId: data.memberId || "",
    isContribution: Boolean(data.isContribution),
    contributorName: data.contributorName || "",
    contributorPhone: data.contributorPhone || "",
    amount: Number(data.amount) || 0,
    paymentMethod: data.paymentMethod || "Cash",
    paymentDate: data.paymentDate || now.split("T")[0],
    note: data.note || "",
    createdBy: data.createdBy || "organizer",
    createdByName: data.createdByName || "Organizer",
    createdAt: now,
  };

  if (serverDb && data.yatraId) {
    try {
      await setDoc(doc(serverDb, "yatras", data.yatraId, "payments", newId), cleanDocData(payment));
    } catch (e) {
      console.warn("Firestore createDbPayment fallback:", e);
    }
  }
  memoryStore.payments.unshift(payment);
  return payment;
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

// ---------------- EXPENSES ----------------
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

export async function createDbExpense(data: Partial<Expense>): Promise<Expense> {
  const newId = data.id || `exp_${Date.now()}`;
  const now = new Date().toISOString();
  const expense: Expense = {
    id: newId,
    yatraId: data.yatraId || "",
    category: data.category || "Other",
    amount: Number(data.amount) || 0,
    expenseDate: data.expenseDate || now.split("T")[0],
    paidBy: data.paidBy || "Organizer",
    description: data.description || "",
    createdBy: data.createdBy || "organizer",
    createdAt: now,
    updatedAt: now,
  };

  if (serverDb && data.yatraId) {
    try {
      await setDoc(doc(serverDb, "yatras", data.yatraId, "expenses", newId), cleanDocData(expense));
    } catch (e) {
      console.warn("Firestore createDbExpense fallback:", e);
    }
  }
  memoryStore.expenses.unshift(expense);
  return expense;
}

export async function updateDbExpense(id: string, data: Partial<Expense>): Promise<Expense | null> {
  const updatedData = { ...data, updatedAt: new Date().toISOString() };
  const current = memoryStore.expenses.find((e) => e.id === id);
  const yatraId = data.yatraId || current?.yatraId;

  if (serverDb && yatraId) {
    try {
      await updateDoc(doc(serverDb, "yatras", yatraId, "expenses", id), cleanDocData(updatedData));
    } catch (e) {
      console.warn("Firestore updateDbExpense fallback:", e);
    }
  }
  const idx = memoryStore.expenses.findIndex((e) => e.id === id);
  if (idx !== -1) {
    memoryStore.expenses[idx] = { ...memoryStore.expenses[idx], ...updatedData };
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

// ---------------- SAHAYAKS ----------------
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

export async function createDbSahayak(data: Partial<Sahayak>): Promise<Sahayak> {
  const staffUid = data.uid || data.id || `sahayak_${Date.now()}`;
  const now = new Date().toISOString();
  const newSahayak: Sahayak = {
    id: staffUid,
    uid: staffUid,
    yatraId: data.yatraId || "",
    role: data.role || "sahayak",
    status: data.status || "active",
    name: data.name || "",
    phone: data.phone || "",
    email: data.email || "",
    memberId: data.memberId || "",
    createdAt: now,
    addedAt: now,
    addedBy: data.addedBy || "organizer",
  };

  if (serverDb && data.yatraId) {
    try {
      await setDoc(doc(serverDb, "yatras", data.yatraId, "staff", staffUid), cleanDocData(newSahayak));
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

// ---------------- INVITATIONS ----------------
export async function getDbInvitations(yatraId: string): Promise<YatraInvitation[]> {
  if (serverDb && yatraId) {
    try {
      const snap = await getDocs(collection(serverDb, "yatras", yatraId, "invitations"));
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as YatraInvitation));
      }
    } catch (e) {
      console.warn("Firestore getDbInvitations fallback:", e);
    }
  }
  return memoryStore.invitations.filter((i) => i.yatraId === yatraId);
}

export async function getDbInvitationByToken(token: string): Promise<YatraInvitation | null> {
  if (serverDb && token) {
    try {
      const d = await getDoc(doc(serverDb, "invitations", token));
      if (d.exists()) {
        return { id: d.id, ...d.data() } as YatraInvitation;
      }
    } catch (e) {
      console.warn("Firestore getDbInvitationByToken fallback:", e);
    }
  }
  return memoryStore.invitations.find((i) => i.token === token) || null;
}

export async function createDbInvitation(data: Partial<YatraInvitation>): Promise<YatraInvitation> {
  const inviteId = data.id || `inv_${Date.now()}`;
  const token = data.token || `inv_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const invitation: YatraInvitation = {
    id: inviteId,
    token,
    yatraId: data.yatraId || "",
    yatraName: data.yatraName || "Kanwar Yatra",
    organizerName: data.organizerName || "Organizer",
    email: data.email || "",
    name: data.name || "",
    phone: data.phone || "",
    memberId: data.memberId || "",
    role: "sahayak",
    status: "pending",
    invitedBy: data.invitedBy || "organizer",
    createdAt: now,
    expiresAt,
  };

  if (serverDb && data.yatraId) {
    try {
      const cleaned = cleanDocData(invitation);
      await setDoc(doc(serverDb, "yatras", data.yatraId, "invitations", inviteId), cleaned);
      await setDoc(doc(serverDb, "invitations", token), cleaned);
    } catch (e) {
      console.warn("Firestore createDbInvitation fallback:", e);
    }
  }
  memoryStore.invitations.unshift(invitation);
  return invitation;
}

export async function cancelDbInvitation(inviteId: string, token: string, yatraId: string): Promise<boolean> {
  if (serverDb && yatraId) {
    try {
      await deleteDoc(doc(serverDb, "yatras", yatraId, "invitations", inviteId));
      if (token) {
        await deleteDoc(doc(serverDb, "invitations", token));
      }
    } catch (e) {
      console.warn("Firestore cancelDbInvitation fallback:", e);
    }
  }
  memoryStore.invitations = memoryStore.invitations.filter((i) => i.id !== inviteId && i.token !== token);
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
      await setDoc(doc(serverDb, "users", user.id), cleanDocData(user));
    } catch (e) {
      console.warn("Firestore createDbUser fallback:", e);
    }
  }
  memoryStore.users.push(user);
  return user;
}
