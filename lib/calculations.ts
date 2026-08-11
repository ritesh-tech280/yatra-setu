import type { Expense, Member, Payment, MemberBalance, FinancialSummary, PaymentStatus, ExpenseCategory, PaymentMethod } from "@/types/yatra";

/**
 * Format any number as Indian Rupee (INR) currency string e.g. ₹1,65,000
 */
export const inr = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Pure calculation for an individual member's balance and status
 */
export function getMemberBalance(
  memberId: string,
  payments: Payment[],
  fare: number
): MemberBalance {
  const memberPayments = payments.filter((p) => p.memberId === memberId);
  const paid = memberPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const remaining = Math.max(fare - paid, 0);

  let status: PaymentStatus = "Pending";
  if (paid >= fare && fare > 0) {
    status = "Fully Paid";
  } else if (paid > 0) {
    status = "Partial";
  } else {
    status = "Pending";
  }

  // Find most recent payment date if any
  const sortedPayments = [...memberPayments].sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );
  const lastPaymentDate = sortedPayments[0]?.paymentDate;

  return {
    paid,
    remaining,
    status,
    paymentCount: memberPayments.length,
    lastPaymentDate,
  };
}

/**
 * Validate payment amount against business rules:
 * 1. Must be a valid positive number (> 0)
 * 2. Cannot exceed member's remaining due amount
 */
export function validatePaymentAmount(
  memberId: string,
  amount: number,
  payments: Payment[],
  fare: number
): { valid: boolean; maxAllowed: number; error?: string } {
  if (!amount || isNaN(amount) || amount <= 0) {
    return {
      valid: false,
      maxAllowed: 0,
      error: "Amount must be a positive number greater than 0.",
    };
  }

  const { remaining } = getMemberBalance(memberId, payments, fare);

  if (remaining <= 0) {
    return {
      valid: false,
      maxAllowed: 0,
      error: "This member has already paid their full fare (₹0 due).",
    };
  }

  if (amount > remaining) {
    return {
      valid: false,
      maxAllowed: remaining,
      error: `Payment of ${inr(amount)} exceeds remaining due of ${inr(remaining)}. Maximum allowed payment is ${inr(remaining)}.`,
    };
  }

  return {
    valid: true,
    maxAllowed: remaining,
  };
}

/**
 * Calculate the complete financial overview for the Yatra dashboard and report
 */
export function calculateSummary(
  members: Member[],
  payments: Payment[],
  expenses: Expense[],
  fare: number
): FinancialSummary {
  const totalMembers = members.length;
  const expected = totalMembers * (Number(fare) || 0);

  let memberCollected = 0;
  let contributions = 0;
  let collected = 0;

  for (const p of payments) {
    const amt = Number(p.amount) || 0;
    collected += amt;
    if (p.isContribution || !p.memberId) {
      contributions += amt;
    } else {
      memberCollected += amt;
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Outstanding is the sum of remaining dues across all registered members
  let outstanding = 0;
  let full = 0;
  let partial = 0;
  let pending = 0;

  for (const member of members) {
    const { status, remaining } = getMemberBalance(member.id, payments, fare);
    outstanding += remaining;
    if (status === "Fully Paid") full++;
    else if (status === "Partial") partial++;
    else pending++;
  }

  // Current treasury balance is Total Collected - Total Expenses
  const balance = collected - totalExpenses;

  const collectionPercentage =
    expected > 0
      ? Math.min(Math.round((memberCollected / expected) * 100), 100)
      : collected > 0
      ? 100
      : 0;

  const expensePercentage =
    collected > 0 ? Math.round((totalExpenses / collected) * 100) : 0;

  return {
    totalMembers,
    expected,
    collected,
    memberCollected,
    contributions,
    outstanding,
    expenses: totalExpenses,
    balance,
    full,
    partial,
    pending,
    collectionPercentage,
    expensePercentage,
  };
}

/**
 * Category-wise expense aggregation for graphs and reports
 */
export interface CategoryTotal {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export function getCategoryTotals(expenses: Expense[]): CategoryTotal[] {
  const map: Record<string, { total: number; count: number }> = {};
  let overallTotal = 0;

  for (const expense of expenses) {
    const cat = expense.category || "Other";
    const amt = Number(expense.amount) || 0;
    overallTotal += amt;

    if (!map[cat]) {
      map[cat] = { total: 0, count: 0 };
    }
    map[cat].total += amt;
    map[cat].count += 1;
  }

  return Object.entries(map)
    .map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: overallTotal > 0 ? Math.round((data.total / overallTotal) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Payment method breakdown (Cash vs UPI vs Bank Transfer vs Other)
 */
export interface PaymentMethodTotal {
  method: PaymentMethod;
  total: number;
  count: number;
  percentage: number;
}

export function getPaymentMethodTotals(payments: Payment[]): PaymentMethodTotal[] {
  const map: Record<string, { total: number; count: number }> = {
    Cash: { total: 0, count: 0 },
    UPI: { total: 0, count: 0 },
    "Bank Transfer": { total: 0, count: 0 },
    Other: { total: 0, count: 0 },
  };

  let overallTotal = 0;
  for (const p of payments) {
    const method = p.paymentMethod || "Cash";
    const amt = Number(p.amount) || 0;
    overallTotal += amt;

    if (!map[method]) {
      map[method] = { total: 0, count: 0 };
    }
    map[method].total += amt;
    map[method].count += 1;
  }

  return Object.entries(map).map(([method, data]) => ({
    method: method as PaymentMethod,
    total: data.total,
    count: data.count,
    percentage: overallTotal > 0 ? Math.round((data.total / overallTotal) * 100) : 0,
  }));
}
