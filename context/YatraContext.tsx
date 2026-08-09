"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import type {
  Yatra,
  Member,
  Payment,
  Expense,
  YatraStaff,
  Sahayak,
  FinancialSummary,
  MemberBalance,
  YatraRole,
} from "@/types/yatra";
import {
  fetchYatras,
  listenToYatras,
  saveYatra,
  updateYatraDetails,
  deleteYatraFromDb,
  fetchMembers,
  listenToMembers,
  saveMember,
  updateMemberDetails,
  deleteMemberFromDb,
  fetchPayments,
  listenToPayments,
  savePayment,
  deletePaymentFromDb,
  fetchExpenses,
  listenToExpenses,
  saveExpense,
  updateExpenseDetails,
  deleteExpenseFromDb,
  fetchSahayaks,
  listenToSahayaks,
  addSahayak,
  removeSahayakFromDb,
  getYatraRole,
} from "@/lib/firebase/firestoreService";
import {
  canEditYatra,
  canDeleteYatra,
  canAddMember,
  canEditMember,
  canDeleteMember,
  canAddPayment,
  canDeletePayment,
  canAddExpense,
  canEditExpense,
  canDeleteExpense,
  canManageSahayaks,
} from "@/lib/permissions";
import { calculateSummary, getMemberBalance, validatePaymentAmount } from "@/lib/calculations";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

interface YatraContextType {
  activeYatra: Yatra | null;
  yatras: Yatra[];
  loading: boolean;
  userRole: YatraRole;
  isOrganizer: boolean;
  isSahayak: boolean;
  hasAccess: boolean;
  members: Member[];
  payments: Payment[];
  expenses: Expense[];
  sahayaks: YatraStaff[];
  summary: FinancialSummary;
  getMemberStatus: (memberId: string) => MemberBalance;
  switchYatra: (yatraId: string) => void;
  // Yatra CRUD
  createNewYatra: (data: Omit<Yatra, "id" | "createdAt" | "updatedAt">) => Promise<Yatra>;
  editYatra: (yatraId: string, updates: Partial<Yatra>) => Promise<void>;
  removeYatra: (yatraId: string) => Promise<void>;
  // Member CRUD
  addNewMember: (data: { name: string; phone: string; address?: string; notes?: string }) => Promise<Member | null>;
  editMember: (memberId: string, data: Partial<Member>) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  // Payment CRUD
  recordPayment: (data: {
    memberId: string;
    amount: number;
    paymentMethod: Payment["paymentMethod"];
    paymentDate?: string;
    note?: string;
  }) => Promise<Payment | null>;
  removePayment: (paymentId: string) => Promise<void>;
  // Expense CRUD
  addNewExpense: (data: {
    category: string;
    amount: number;
    expenseDate?: string;
    paidBy: string;
    description?: string;
  }) => Promise<Expense | null>;
  editExpense: (expenseId: string, data: Partial<Expense>) => Promise<void>;
  removeExpense: (expenseId: string) => Promise<void>;
  // Sahayak CRUD
  addNewSahayak: (data: { uid?: string; name: string; phone: string; email?: string; memberId?: string }) => Promise<YatraStaff | null>;
  removeSahayak: (sahayakId: string) => Promise<void>;
  // Utilities
  refreshData: () => Promise<void>;
  resetToSeedData: () => void;
}

const YatraContext = createContext<YatraContextType | undefined>(undefined);

export function YatraProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [yatras, setYatras] = useState<Yatra[]>([]);
  const [activeYatraId, setActiveYatraId] = useState<string>("");
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [sahayaks, setSahayaks] = useState<YatraStaff[]>([]);
  const [loading, setLoading] = useState(true);

  // Active yatra reference
  const activeYatra = useMemo(() => {
    return yatras.find((y) => y.id === activeYatraId) || yatras[0] || null;
  }, [yatras, activeYatraId]);

  // Dynamic Yatra Role Resolution
  const [userRole, setUserRole] = useState<YatraRole>("no_access");

  useEffect(() => {
    const currentUid = user?.uid || user?.id;
    if (!currentUid || !activeYatra) {
      setUserRole("no_access");
      return;
    }

    // Direct check if currentUser is Organizer
    if (activeYatra.organizerId === currentUid) {
      setUserRole("organizer");
      return;
    }

    // Demo role switch support
    if (user?.role === "organizer" || user?.id === "org-1") {
      setUserRole("organizer");
      return;
    }
    if (user?.role === "sahayak" || user?.id === "sahayak-1") {
      setUserRole("sahayak");
      return;
    }

    // Resolve from Firestore
    getYatraRole(activeYatra.id, currentUid)
      .then((r) => setUserRole(r))
      .catch(() => setUserRole("no_access"));
  }, [user, activeYatra]);

  const isOrganizer = userRole === "organizer";
  const isSahayak = userRole === "sahayak";
  const hasAccess = userRole === "organizer" || userRole === "sahayak";

  // Load and listen to all Yatras
  useEffect(() => {
    const currentUid = user?.uid || user?.id;
    fetchYatras(currentUid).then((list) => {
      setYatras(list);
      if (list.length > 0) {
        setActiveYatraId((prev) => (prev && list.some((y) => y.id === prev) ? prev : list[0].id));
      }
      setLoading(false);
    });

    const unsub = listenToYatras((list) => {
      if (list && list.length > 0) {
        setYatras(list);
        setActiveYatraId((prev) => (prev && list.some((y) => y.id === prev) ? prev : list[0].id));
      }
    });

    return () => {
      if (unsub) unsub();
    };
  }, [user?.id, user?.uid]);

  // Load and listen to active Yatra's nested subcollections
  useEffect(() => {
    const yId = activeYatra?.id;
    if (!yId) {
      setMembers([]);
      setPayments([]);
      setExpenses([]);
      setSahayaks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    Promise.all([
      fetchMembers(yId),
      fetchPayments(yId),
      fetchExpenses(yId),
      fetchSahayaks(yId),
    ])
      .then(([mList, pList, eList, sList]) => {
        setMembers(mList);
        setPayments(pList);
        setExpenses(eList);
        setSahayaks(sList);
      })
      .catch((e) => {
        console.error("Failed to load yatra subcollections:", e);
      })
      .finally(() => {
        setLoading(false);
      });

    const unsubMembers = listenToMembers(yId, (list) => setMembers(list));
    const unsubPayments = listenToPayments(yId, (list) => setPayments(list));
    const unsubExpenses = listenToExpenses(yId, (list) => setExpenses(list));
    const unsubSahayaks = listenToSahayaks(yId, (list) => setSahayaks(list));

    return () => {
      if (unsubMembers) unsubMembers();
      if (unsubPayments) unsubPayments();
      if (unsubExpenses) unsubExpenses();
      if (unsubSahayaks) unsubSahayaks();
    };
  }, [activeYatra?.id]);

  // Memoized financial summary
  const summary = useMemo(() => {
    const fare = activeYatra?.fare || 0;
    return calculateSummary(members, payments, expenses, fare);
  }, [members, payments, expenses, activeYatra?.fare]);

  // Member balance calculation helper
  const getMemberStatus = useCallback(
    (memberId: string): MemberBalance => {
      const fare = activeYatra?.fare || 0;
      return getMemberBalance(memberId, payments, fare);
    },
    [payments, activeYatra?.fare]
  );

  const switchYatra = (yId: string) => {
    setActiveYatraId(yId);
  };

  // ---------------- YATRA ACTIONS ----------------
  const createNewYatra = async (data: Omit<Yatra, "id" | "createdAt" | "updatedAt">): Promise<Yatra> => {
    const currentUid = user?.uid || user?.id || "org-1";
    try {
      const created = await saveYatra({
        ...data,
        organizerId: currentUid,
        organizerName: user?.name || data.organizerName || "Organizer",
      });
      setYatras((prev) => [created, ...prev.filter((y) => y.id !== created.id)]);
      setActiveYatraId(created.id);
      success(`Yatra "${created.name}" created!`);
      return created;
    } catch (e: any) {
      error(e?.message || "Failed to create Yatra.");
      throw e;
    }
  };

  const editYatra = async (yatraId: string, updates: Partial<Yatra>) => {
    if (!canEditYatra(userRole)) {
      error("Permission Denied: Only Organizer can edit Yatra settings.");
      return;
    }
    try {
      await updateYatraDetails(yatraId, updates);
      setYatras((prev) =>
        prev.map((y) => (y.id === yatraId ? { ...y, ...updates, updatedAt: new Date().toISOString() } : y))
      );
      success("Yatra settings updated!");
    } catch (e: any) {
      error(e?.message || "Failed to update Yatra.");
    }
  };

  const removeYatra = async (yatraId: string) => {
    if (!canDeleteYatra(userRole)) {
      error("Permission Denied: Only Organizer can delete a Yatra.");
      return;
    }
    try {
      await deleteYatraFromDb(yatraId);
      const remaining = yatras.filter((y) => y.id !== yatraId);
      setYatras(remaining);
      if (remaining.length > 0) {
        setActiveYatraId(remaining[0].id);
      } else {
        setActiveYatraId("");
      }
      success("Yatra deleted.");
    } catch (e: any) {
      error(e?.message || "Failed to delete Yatra.");
    }
  };

  // ---------------- MEMBER ACTIONS ----------------
  const addNewMember = async (data: {
    name: string;
    phone: string;
    address?: string;
    notes?: string;
  }): Promise<Member | null> => {
    if (!canAddMember(userRole)) {
      error("Permission Denied: You do not have permission to add members.");
      return null;
    }
    if (!activeYatra) {
      error("No active Yatra selected.");
      return null;
    }
    try {
      const newMember = await saveMember({
        yatraId: activeYatra.id,
        name: data.name.trim(),
        phone: data.phone.trim(),
        address: data.address?.trim() || "",
        notes: data.notes?.trim() || "",
      });
      setMembers((prev) => [newMember, ...prev.filter((m) => m.id !== newMember.id)]);
      success(`Member "${newMember.name}" saved!`);
      return newMember;
    } catch (e: any) {
      error(e?.message || "Failed to add Member.");
      return null;
    }
  };

  const editMember = async (memberId: string, data: Partial<Member>) => {
    if (!canEditMember(userRole)) {
      error("Permission Denied: You do not have permission to edit members.");
      return;
    }
    if (!activeYatra) return;
    try {
      await updateMemberDetails(activeYatra.id, memberId, data);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, ...data, updatedAt: new Date().toISOString() } : m))
      );
      success("Member details updated.");
    } catch (e: any) {
      error(e?.message || "Failed to update Member.");
    }
  };

  const removeMember = async (memberId: string) => {
    if (!canDeleteMember(userRole)) {
      error("Permission Denied: Only Organizer can delete members.");
      return;
    }
    if (!activeYatra) return;
    try {
      await deleteMemberFromDb(activeYatra.id, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      success("Member removed.");
    } catch (e: any) {
      error(e?.message || "Failed to delete Member.");
    }
  };

  // ---------------- PAYMENT ACTIONS ----------------
  const recordPayment = async (data: {
    memberId: string;
    amount: number;
    paymentMethod: Payment["paymentMethod"];
    paymentDate?: string;
    note?: string;
  }): Promise<Payment | null> => {
    if (!canAddPayment(userRole)) {
      error("Permission Denied: You do not have permission to record payments.");
      return null;
    }
    if (!activeYatra) {
      error("No active Yatra selected.");
      return null;
    }

    const member = members.find((m) => m.id === data.memberId);
    if (!member) {
      error("Please select a valid Member.");
      return null;
    }

    const validation = validatePaymentAmount(data.memberId, data.amount, payments, activeYatra.fare);
    if (!validation.valid) {
      error(validation.error || "Invalid payment amount.");
      return null;
    }

    try {
      const currentUid = user?.uid || user?.id || "org-1";
      const newPayment = await savePayment({
        yatraId: activeYatra.id,
        memberId: data.memberId,
        amount: Number(data.amount),
        paymentMethod: data.paymentMethod,
        paymentDate: data.paymentDate || new Date().toISOString().split("T")[0],
        note: data.note?.trim() || "",
        createdBy: currentUid,
        createdByName: user?.name || "Organizer",
      });

      setPayments((prev) => [newPayment, ...prev.filter((p) => p.id !== newPayment.id)]);
      success(`₹${data.amount.toLocaleString("en-IN")} payment recorded for ${member.name}!`);
      return newPayment;
    } catch (e: any) {
      error(e?.message || "Failed to record payment.");
      return null;
    }
  };

  const removePayment = async (paymentId: string) => {
    if (!canDeletePayment(userRole)) {
      error("Permission Denied: Only Organizer can delete payments.");
      return;
    }
    if (!activeYatra) return;
    try {
      await deletePaymentFromDb(activeYatra.id, paymentId);
      setPayments((prev) => prev.filter((p) => p.id !== paymentId));
      success("Payment transaction removed.");
    } catch (e: any) {
      error(e?.message || "Failed to remove payment.");
    }
  };

  // ---------------- EXPENSE ACTIONS ----------------
  const addNewExpense = async (data: {
    category: string;
    amount: number;
    expenseDate?: string;
    paidBy: string;
    description?: string;
  }): Promise<Expense | null> => {
    if (!canAddExpense(userRole)) {
      error("Permission Denied: You do not have permission to record expenses.");
      return null;
    }
    if (!activeYatra) {
      error("No active Yatra selected.");
      return null;
    }

    try {
      const currentUid = user?.uid || user?.id || "org-1";
      const newExpense = await saveExpense({
        yatraId: activeYatra.id,
        category: data.category as any,
        amount: Number(data.amount),
        expenseDate: data.expenseDate || new Date().toISOString().split("T")[0],
        paidBy: data.paidBy.trim(),
        description: data.description?.trim() || "",
        createdBy: currentUid,
      });

      setExpenses((prev) => [newExpense, ...prev.filter((e) => e.id !== newExpense.id)]);
      success(`₹${data.amount.toLocaleString("en-IN")} expense recorded.`);
      return newExpense;
    } catch (e: any) {
      error(e?.message || "Failed to record expense.");
      return null;
    }
  };

  const editExpense = async (expenseId: string, data: Partial<Expense>) => {
    if (!canEditExpense(userRole)) {
      error("Permission Denied: You do not have permission to edit expenses.");
      return;
    }
    if (!activeYatra) return;
    try {
      await updateExpenseDetails(activeYatra.id, expenseId, data);
      setExpenses((prev) =>
        prev.map((e) => (e.id === expenseId ? { ...e, ...data, updatedAt: new Date().toISOString() } : e))
      );
      success("Expense updated.");
    } catch (e: any) {
      error(e?.message || "Failed to update expense.");
    }
  };

  const removeExpense = async (expenseId: string) => {
    if (!canDeleteExpense(userRole)) {
      error("Permission Denied: Only Organizer can delete expenses.");
      return;
    }
    if (!activeYatra) return;
    try {
      await deleteExpenseFromDb(activeYatra.id, expenseId);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      success("Expense entry removed.");
    } catch (e: any) {
      error(e?.message || "Failed to delete expense.");
    }
  };

  // ---------------- SAHAYAK ACTIONS (Nested: yatras/{yatraId}/staff/{uid}) ----------------
  const addNewSahayak = async (data: {
    uid?: string;
    name: string;
    phone: string;
    email?: string;
    memberId?: string;
  }): Promise<YatraStaff | null> => {
    if (!canManageSahayaks(userRole)) {
      error("Permission Denied: Only Organizer can assign Sahayaks.");
      return null;
    }
    if (!activeYatra) return null;

    try {
      const staffUid = data.uid?.trim() || `sahayak-${Date.now()}`;
      const newStaff = await addSahayak(activeYatra.id, {
        uid: staffUid,
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || "",
        memberId: data.memberId || "",
      });

      setSahayaks((prev) => [newStaff, ...prev.filter((s) => s.id !== newStaff.id && s.uid !== newStaff.uid)]);
      success(`Sahayak "${newStaff.name || newStaff.uid}" assigned to Yatra!`);
      return newStaff;
    } catch (e: any) {
      error(e?.message || "Failed to add Sahayak.");
      return null;
    }
  };

  const removeSahayak = async (sahayakId: string) => {
    if (!canManageSahayaks(userRole)) {
      error("Permission Denied: Only Organizer can remove Sahayaks.");
      return;
    }
    if (!activeYatra) return;
    try {
      await removeSahayakFromDb(activeYatra.id, sahayakId);
      setSahayaks((prev) => prev.filter((s) => s.id !== sahayakId && s.uid !== sahayakId));
      success("Sahayak removed.");
    } catch (e: any) {
      error(e?.message || "Failed to remove Sahayak.");
    }
  };

  const refreshData = async () => {
    if (activeYatra?.id) {
      const [mList, pList, eList, sList] = await Promise.all([
        fetchMembers(activeYatra.id),
        fetchPayments(activeYatra.id),
        fetchExpenses(activeYatra.id),
        fetchSahayaks(activeYatra.id),
      ]);
      setMembers(mList);
      setPayments(pList);
      setExpenses(eList);
      setSahayaks(sList);
    }
  };

  const resetToSeedData = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <YatraContext.Provider
      value={{
        activeYatra,
        yatras,
        loading,
        userRole,
        isOrganizer,
        isSahayak,
        hasAccess,
        members,
        payments,
        expenses,
        sahayaks,
        summary,
        getMemberStatus,
        switchYatra,
        createNewYatra,
        editYatra,
        removeYatra,
        addNewMember,
        editMember,
        removeMember,
        recordPayment,
        removePayment,
        addNewExpense,
        editExpense,
        removeExpense,
        addNewSahayak,
        removeSahayak,
        refreshData,
        resetToSeedData,
      }}
    >
      {children}
    </YatraContext.Provider>
  );
}

export function useYatraData() {
  const context = useContext(YatraContext);
  if (!context) {
    throw new Error("useYatraData must be used within a YatraProvider");
  }
  return context;
}
