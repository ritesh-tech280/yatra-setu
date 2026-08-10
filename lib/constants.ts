import type { ExpenseCategory, PaymentMethod, PaymentStatus, Yatra, Member, Payment, Expense, Sahayak } from "@/types/yatra";

export const EXPENSE_CATEGORIES: { category: ExpenseCategory; label: string; icon: string; color: string }[] = [
  { category: "Transport / Bus", label: "Transport & Bus", icon: "🚌", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  { category: "Food", label: "Food & Refreshments", icon: "🍲", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
  { category: "DJ", label: "Sound & DJ System", icon: "🎵", color: "bg-purple-500/10 text-purple-600 border-purple-200" },
  { category: "Fuel", label: "Vehicle Fuel & Diesel", icon: "⛽", color: "bg-orange-500/10 text-orange-600 border-orange-200" },
  { category: "Accommodation", label: "Stay & Accommodation", icon: "⛺", color: "bg-indigo-500/10 text-indigo-600 border-indigo-200" },
  { category: "Water", label: "Mineral & Drinking Water", icon: "💧", color: "bg-cyan-500/10 text-cyan-600 border-cyan-200" },
  { category: "Supplies / Material", label: "Yatra & Ritual Supplies", icon: "🚩", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  { category: "Medical", label: "Medical & First Aid", icon: "💊", color: "bg-rose-500/10 text-rose-600 border-rose-200" },
  { category: "Other", label: "Miscellaneous Expenses", icon: "📦", color: "bg-slate-500/10 text-slate-600 border-slate-200" },
];

export const PAYMENT_METHODS: { method: PaymentMethod; label: string; icon: string }[] = [
  { method: "Cash", label: "Cash", icon: "💵" },
  { method: "UPI", label: "UPI (Google Pay / PhonePe / Paytm)", icon: "📱" },
  { method: "Other", label: "Other Method", icon: "🏷️" },
];

export const PAYMENT_STATUS_MAP: Record<PaymentStatus, { label: string; badgeClass: string; bgClass: string }> = {
  "Fully Paid": {
    label: "Fully Paid",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700",
    bgClass: "bg-emerald-50 text-emerald-700",
  },
  "Partial": {
    label: "Partially Paid",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700",
    bgClass: "bg-amber-50 text-amber-700",
  },
  "Pending": {
    label: "Payment Pending",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700",
    bgClass: "bg-rose-50 text-rose-700",
  },
};
