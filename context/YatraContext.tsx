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
  YatraInvitation,
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
  fetchInvitations,
  listenToInvitations,
  createYatraInvitation,
  cancelYatraInvitation,
  getYatraRole,
  clearLocalCache,
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
import { auth } from "@/config/firebaseConfig";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

interface YatraContextType {
  activeYatra: Yatra | null;
  activeYatraId: string;
  setActiveYatraId: (id: string) => void;
  yatras: Yatra[];
  loading: boolean;
  isSwitchingEvent: boolean;
  userRole: YatraRole;
  roleLoading: boolean;
  isOrganizer: boolean;
  isSahayak: boolean;
  hasAccess: boolean;
  members: Member[];
  payments: Payment[];
  expenses: Expense[];
  sahayaks: YatraStaff[];
  invitations: YatraInvitation[];
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
  recordPayment: (data: {
    memberId?: string;
    isContribution?: boolean;
    contributorName?: string;
    contributorPhone?: string;
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
  // Sahayak & Invitations CRUD
  addNewSahayak: (data: { uid?: string; name: string; phone: string; email?: string; memberId?: string }) => Promise<YatraStaff | null>;
  removeSahayak: (sahayakId: string) => Promise<void>;
  sendSahayakInvitation: (data: {
    email: string;
    name?: string;
    phone?: string;
    memberId?: string;
  }) => Promise<{ invitation: YatraInvitation; inviteUrl: string } | null>;
  cancelSahayakInvite: (inviteId: string, token: string) => Promise<void>;
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
  const [invitations, setInvitations] = useState<YatraInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSwitchingEvent, setIsSwitchingEvent] = useState(false);

  // Active Yatra computed
  const activeYatra = useMemo(() => {
    return yatras.find((y) => y.id === activeYatraId) || (yatras.length > 0 ? yatras[0] : null);
  }, [yatras, activeYatraId]);

  // Dynamic Yatra Role Resolution
  const [userRole, setUserRole] = useState<YatraRole>("organizer");
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    const currentUid = user?.uid || user?.id;
    if (!currentUid) {
      setUserRole(user?.role === "sahayak" ? "sahayak" : "organizer");
      setRoleLoading(false);
      return;
    }

    if (!activeYatra) {
      setUserRole(user?.role === "sahayak" ? "sahayak" : "organizer");
      setRoleLoading(false);
      return;
    }

    // Direct check if currentUser is Organizer of active Yatra
    if (activeYatra.organizerId === currentUid) {
      setUserRole("organizer");
      setRoleLoading(false);
      return;
    }

    // Resolve from Firestore
    setRoleLoading(true);
    getYatraRole(activeYatra.id, currentUid)
      .then((r) => {
        if (r === "no_access") {
          // If stored active yatra does not belong to user, clear it and allow creating/managing their own
          setActiveYatraId("");
          setUserRole(user?.role === "sahayak" ? "sahayak" : "organizer");
        } else {
          setUserRole(r);
        }
      })
      .catch(() => {
        setActiveYatraId("");
        setUserRole(user?.role === "sahayak" ? "sahayak" : "organizer");
      })
      .finally(() => setRoleLoading(false));
  }, [user, activeYatra]);

  const isOrganizer = userRole === "organizer";
  const isSahayak = userRole === "sahayak";
  const hasAccess = isOrganizer || isSahayak;

  // 1. Initial Load of Yatras
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    const currentUid = user?.uid || user?.id;

    async function loadYatras() {
      setLoading(true);
      try {
        const fetched = await fetchYatras(currentUid);
        const uniqueFetched = Array.from(new Map(fetched.map((y) => [y.id, y])).values());
        setYatras(uniqueFetched);
        if (uniqueFetched.length > 0) {
          const savedActive = localStorage.getItem("yatrasetu_active_id");
          if (savedActive && uniqueFetched.some((y) => y.id === savedActive)) {
            setActiveYatraId(savedActive);
          } else {
            setActiveYatraId(uniqueFetched[0].id);
          }
        } else {
          setActiveYatraId("");
        }

        unsubscribe = listenToYatras((updated) => {
          const unique = Array.from(new Map(updated.map((y) => [y.id, y])).values());
          setYatras(unique);
          setActiveYatraId((prevActiveId) => {
            if (prevActiveId && unique.some((y) => y.id === prevActiveId)) {
              return prevActiveId;
            }
            const nextActive = unique.length > 0 ? unique[0].id : "";
            if (typeof window !== "undefined") {
              if (nextActive) {
                localStorage.setItem("yatrasetu_active_id", nextActive);
              } else {
                localStorage.removeItem("yatrasetu_active_id");
              }
            }
            return nextActive;
          });
        }, currentUid);
      } catch (err: any) {
        console.error("Error loading Yatras:", err);
      } finally {
        setLoading(false);
      }
    }

    loadYatras();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  // 2. Load nested subcollections strictly for activeYatra
  useEffect(() => {
    if (!activeYatra) {
      setMembers([]);
      setPayments([]);
      setExpenses([]);
      setSahayaks([]);
      setInvitations([]);
      setIsSwitchingEvent(false);
      return;
    }

    const yatraId = activeYatra.id;
    if (typeof window !== "undefined") {
      localStorage.setItem("yatrasetu_active_id", yatraId);
    }

    // Immediately sanitize subcollections from any previous event
    setMembers([]);
    setPayments([]);
    setExpenses([]);
    setSahayaks([]);
    setInvitations([]);
    setIsSwitchingEvent(true);

    let isCurrent = true;

    // Initial fetch of subcollections for active event
    Promise.all([
      fetchMembers(yatraId),
      fetchPayments(yatraId),
      fetchExpenses(yatraId),
      fetchSahayaks(yatraId),
      fetchInvitations(yatraId),
    ])
      .then(([mList, pList, eList, sList, iList]) => {
        // Discard if the user switched to a different event while fetching
        if (!isCurrent) return;

        setMembers(Array.from(new Map(mList.filter((m) => m.yatraId === yatraId).map((m) => [m.id, m])).values()));
        setPayments(Array.from(new Map(pList.filter((p) => p.yatraId === yatraId).map((p) => [p.id, p])).values()));
        setExpenses(Array.from(new Map(eList.filter((e) => e.yatraId === yatraId).map((e) => [e.id, e])).values()));
        setSahayaks(Array.from(new Map(sList.filter((s) => s.yatraId === yatraId).map((s) => [s.id || s.uid, s])).values()));
        setInvitations(Array.from(new Map(iList.filter((i) => i.yatraId === yatraId).map((i) => [i.id, i])).values()));
        setIsSwitchingEvent(false);
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.error("Error fetching subcollections:", err);
        setIsSwitchingEvent(false);
      });

    // Realtime listeners strictly scoped to active event
    const unsubMembers = listenToMembers(yatraId, (list) => {
      if (!isCurrent) return;
      setMembers(Array.from(new Map(list.filter((m) => m.yatraId === yatraId).map((m) => [m.id, m])).values()));
    });
    const unsubPayments = listenToPayments(yatraId, (list) => {
      if (!isCurrent) return;
      setPayments(Array.from(new Map(list.filter((p) => p.yatraId === yatraId).map((p) => [p.id, p])).values()));
    });
    const unsubExpenses = listenToExpenses(yatraId, (list) => {
      if (!isCurrent) return;
      setExpenses(Array.from(new Map(list.filter((e) => e.yatraId === yatraId).map((e) => [e.id, e])).values()));
    });
    const unsubSahayaks = listenToSahayaks(yatraId, (list) => {
      if (!isCurrent) return;
      setSahayaks(Array.from(new Map(list.filter((s) => s.yatraId === yatraId).map((s) => [s.id || s.uid, s])).values()));
    });
    const unsubInvitations = listenToInvitations(yatraId, (list) => {
      if (!isCurrent) return;
      setInvitations(Array.from(new Map(list.filter((i) => i.yatraId === yatraId).map((i) => [i.id, i])).values()));
    });

    return () => {
      isCurrent = false;
      if (unsubMembers) unsubMembers();
      if (unsubPayments) unsubPayments();
      if (unsubExpenses) unsubExpenses();
      if (unsubSahayaks) unsubSahayaks();
      if (unsubInvitations) unsubInvitations();
    };
  }, [activeYatra?.id]);

  // Switch active Yatra with immediate state clearing
  const switchYatra = useCallback((yatraId: string) => {
    setIsSwitchingEvent(true);
    setMembers([]);
    setPayments([]);
    setExpenses([]);
    setSahayaks([]);
    setInvitations([]);
    setActiveYatraId(yatraId);
    if (typeof window !== "undefined") {
      localStorage.setItem("yatrasetu_active_id", yatraId);
    }
  }, []);

  // Compute live financial summary
  const summary: FinancialSummary = useMemo(() => {
    return calculateSummary(members, payments, expenses, activeYatra?.fare || 0);
  }, [members, payments, expenses, activeYatra?.fare]);

  // Helper for single member status
  const getMemberStatus = useCallback(
    (memberId: string): MemberBalance => {
      return getMemberBalance(memberId, payments, activeYatra?.fare || 0);
    },
    [payments, activeYatra?.fare]
  );

  // ---------------- YATRA ACTIONS ----------------
  const createNewYatra = async (
    data: Omit<Yatra, "id" | "createdAt" | "updatedAt">
  ): Promise<Yatra> => {
    const currentUid = user?.uid || user?.id || "organizer";
    const currentName = user?.name || "Organizer";

    // Immediately isolate subcollection state for the new event
    setMembers([]);
    setPayments([]);
    setExpenses([]);
    setSahayaks([]);
    setInvitations([]);

    const newYatra = await saveYatra({
      ...data,
      organizerId: currentUid,
      organizerName: currentName,
    });

    setYatras((prev) => [newYatra, ...prev.filter((y) => y.id !== newYatra.id)]);
    setActiveYatraId(newYatra.id);
    if (typeof window !== "undefined") {
      localStorage.setItem("yatrasetu_active_id", newYatra.id);
    }
    success(`Event "${newYatra.name}" created successfully!`);
    return newYatra;
  };

  const editYatra = async (yatraId: string, updates: Partial<Yatra>) => {
    if (!canEditYatra(userRole)) {
      error("Permission Denied: Only the Organizer can update Yatra settings.");
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
      error("Permission Denied: Only the Organizer can delete a Yatra.");
      return;
    }

    try {
      await deleteYatraFromDb(yatraId);
      const remaining = yatras.filter((y) => y.id !== yatraId);
      setYatras(remaining);
      if (activeYatraId === yatraId) {
        const nextYatra = remaining.length > 0 ? remaining[0] : null;
        const nextId = nextYatra ? nextYatra.id : "";
        setActiveYatraId(nextId);
        if (typeof window !== "undefined") {
          if (nextId) {
            localStorage.setItem("yatrasetu_active_id", nextId);
          } else {
            localStorage.removeItem("yatrasetu_active_id");
          }
        }
        if (!nextYatra) {
          setMembers([]);
          setPayments([]);
          setExpenses([]);
          setSahayaks([]);
          setInvitations([]);
        }
      }
      success("Yatra deleted successfully.");
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
      error("Please select an active Yatra first.");
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
      success(`Member "${newMember.name}" registered!`);
      return newMember;
    } catch (e: any) {
      error(e?.message || "Failed to add member.");
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
      error(e?.message || "Failed to update member.");
    }
  };

  const removeMember = async (memberId: string) => {
    if (!canDeleteMember(userRole)) {
      error("Permission Denied: Only the Organizer can delete members.");
      return;
    }
    if (!activeYatra) return;

    try {
      await deleteMemberFromDb(activeYatra.id, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      setPayments((prev) => prev.filter((p) => p.memberId !== memberId));
      success("Member deleted.");
    } catch (e: any) {
      error(e?.message || "Failed to delete member.");
    }
  };

  // ---------------- PAYMENT ACTIONS ----------------
  const recordPayment = async (data: {
    memberId?: string;
    isContribution?: boolean;
    contributorName?: string;
    contributorPhone?: string;
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

    const numAmount = Number(data.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      error("Please enter a valid amount greater than 0.");
      return null;
    }

    if (data.isContribution) {
      if (!data.contributorName?.trim()) {
        error("Contributor / Donor name is required.");
        return null;
      }
    } else {
      if (!data.memberId) {
        error("Please select a member.");
        return null;
      }
      const validation = validatePaymentAmount(
        data.memberId,
        numAmount,
        payments,
        activeYatra.fare
      );
      if (!validation.valid) {
        error(validation.error || "Invalid payment amount");
        return null;
      }
    }

    try {
      const currentUid = user?.uid || user?.id || "organizer";
      const newPayment = await savePayment({
        yatraId: activeYatra.id,
        memberId: data.isContribution ? "" : (data.memberId || ""),
        isContribution: Boolean(data.isContribution),
        contributorName: data.contributorName?.trim() || "",
        contributorPhone: data.contributorPhone?.trim() || "",
        amount: numAmount,
        paymentMethod: data.paymentMethod,
        paymentDate: data.paymentDate || new Date().toISOString().split("T")[0],
        note: data.note?.trim() || "",
        createdBy: currentUid,
        createdByName: user?.name || "Organizer",
      });

      setPayments((prev) => [newPayment, ...prev.filter((p) => p.id !== newPayment.id)]);

      if (data.isContribution) {
        success(`₹${numAmount.toLocaleString("en-IN")} contribution recorded from ${data.contributorName}!`);
      } else {
        const member = members.find((m) => m.id === data.memberId);
        success(`₹${numAmount.toLocaleString("en-IN")} payment recorded for ${member?.name || "member"}!`);
      }
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
      success("Payment record deleted.");
    } catch (e: any) {
      error(e?.message || "Failed to delete payment.");
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
      error("Permission Denied: You do not have permission to add expenses.");
      return null;
    }
    if (!activeYatra) {
      error("No active Yatra selected.");
      return null;
    }

    try {
      const currentUid = user?.uid || user?.id || "organizer";
      const newExpense = await saveExpense({
        yatraId: activeYatra.id,
        category: data.category,
        amount: Number(data.amount),
        expenseDate: data.expenseDate || new Date().toISOString().split("T")[0],
        paidBy: data.paidBy || user?.name || "Organizer",
        description: data.description || "",
        createdBy: currentUid,
      });

      setExpenses((prev) => [newExpense, ...prev.filter((e) => e.id !== newExpense.id)]);
      success(`₹${data.amount.toLocaleString("en-IN")} logged under ${data.category}!`);
      return newExpense;
    } catch (e: any) {
      error(e?.message || "Failed to add expense.");
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
        prev.map((exp) => (exp.id === expenseId ? { ...exp, ...data, updatedAt: new Date().toISOString() } : exp))
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
      success("Expense record deleted.");
    } catch (e: any) {
      error(e?.message || "Failed to delete expense.");
    }
  };

  // ---------------- SAHAYAK ACTIONS ----------------
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

  // ---------------- INVITATIONS ACTIONS ----------------
  const sendSahayakInvitation = async (data: {
    email: string;
    name?: string;
    phone?: string;
    memberId?: string;
  }): Promise<{
    invitation: YatraInvitation;
    inviteUrl: string;
    emailSent?: boolean;
    emailError?: string;
  } | null> => {
    if (!canManageSahayaks(userRole)) {
      error("Permission Denied: Only the Organizer can send Sahayak invitations.");
      return null;
    }
    if (!activeYatra) {
      error("No active Yatra selected.");
      return null;
    }

    try {
      let emailSent = false;
      let emailError: string | undefined = undefined;

      try {
        const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (idToken) headers["Authorization"] = `Bearer ${idToken}`;

        const res = await fetch("/api/invitations", {
          method: "POST",
          headers,
          body: JSON.stringify({
            yatraId: activeYatra.id,
            yatraName: activeYatra.name,
            organizerName: activeYatra.organizerName || user?.name || "Organizer",
            email: data.email.trim().toLowerCase(),
            name: data.name?.trim(),
            phone: data.phone?.trim(),
            memberId: data.memberId,
          }),
        });

        const resJson = await res.json().catch(() => ({}));
        if (res.ok && resJson.data) {
          emailSent = Boolean(resJson.emailSent);
          emailError = resJson.emailError;
          const serverInv = resJson.data as YatraInvitation;
          setInvitations((prev) => [serverInv, ...prev.filter((i) => i.id !== serverInv.id)]);
          const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
          const finalUrl = resJson.inviteUrl || `${origin}/invite/${serverInv.token}`;
          return {
            invitation: serverInv,
            inviteUrl: finalUrl,
            emailSent,
            emailError,
          };
        }
      } catch (apiErr) {
        console.warn("API invitation dispatch note:", apiErr);
      }

      // Fallback to client-side Firestore creation if API was unreachable
      const result = await createYatraInvitation(activeYatra.id, {
        email: data.email.trim().toLowerCase(),
        name: data.name?.trim(),
        phone: data.phone?.trim(),
        memberId: data.memberId,
        organizerName: activeYatra.organizerName || user?.name || "Organizer",
        yatraName: activeYatra.name,
      });

      setInvitations((prev) => [result.invitation, ...prev.filter((i) => i.id !== result.invitation.id)]);
      return {
        invitation: result.invitation,
        inviteUrl: result.inviteUrl,
        emailSent: false,
      };
    } catch (e: any) {
      error(e?.message || "Failed to generate Sahayak invitation.");
      return null;
    }
  };

  const cancelSahayakInvite = async (inviteId: string, token: string) => {
    if (!canManageSahayaks(userRole)) {
      error("Permission Denied: Only Organizer can cancel invitations.");
      return;
    }
    if (!activeYatra) return;

    try {
      await cancelYatraInvitation(activeYatra.id, inviteId, token);
      setInvitations((prev) => prev.filter((i) => i.id !== inviteId && i.token !== token));
      success("Invitation cancelled.");
    } catch (e: any) {
      error(e?.message || "Failed to cancel invitation.");
    }
  };

  const refreshData = async () => {
    if (activeYatra?.id) {
      const [mList, pList, eList, sList, iList] = await Promise.all([
        fetchMembers(activeYatra.id),
        fetchPayments(activeYatra.id),
        fetchExpenses(activeYatra.id),
        fetchSahayaks(activeYatra.id),
        fetchInvitations(activeYatra.id),
      ]);
      setMembers(mList);
      setPayments(pList);
      setExpenses(eList);
      setSahayaks(sList);
      setInvitations(iList);
    }
  };

  const resetToSeedData = () => {
    if (typeof window !== "undefined") {
      const currentUser = localStorage.getItem("yatrasetu_user");
      const currentFirebaseUser = localStorage.getItem("yatrasetu_current_user");

      clearLocalCache();

      if (currentUser) {
        localStorage.setItem("yatrasetu_user", currentUser);
      }
      if (currentFirebaseUser) {
        localStorage.setItem("yatrasetu_current_user", currentFirebaseUser);
      }
      window.location.reload();
    }
  };

  return (
    <YatraContext.Provider
      value={{
        activeYatra,
        activeYatraId,
        setActiveYatraId,
        yatras,
        loading,
        isSwitchingEvent,
        userRole,
        roleLoading,
        isOrganizer,
        isSahayak,
        hasAccess,
        members,
        payments,
        expenses,
        sahayaks,
        invitations,
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
        sendSahayakInvitation,
        cancelSahayakInvite,
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
