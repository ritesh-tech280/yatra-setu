"use client";

import React, { useState } from "react";
import { Modal } from "../common/Modal";
import {
  IndianRupee,
  Calendar,
  UserCheck,
  FileText,
  Save,
  PlusCircle,
} from "lucide-react";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import type { Expense, ExpenseCategory } from "@/types/yatra";
import { useAuth } from "@/context/AuthContext";

interface AddExpenseModalProps {
  expense?: Expense | null;
  onClose: () => void;
  onSubmit: (data: {
    category: string;
    amount: number;
    expenseDate: string;
    paidBy: string;
    description?: string;
  }) => Promise<void>;
}

export function AddExpenseModal({ expense, onClose, onSubmit }: AddExpenseModalProps) {
  const { user } = useAuth();
  const isEditing = Boolean(expense);

  const [category, setCategory] = useState<string>(expense?.category || "Transport / Bus");
  const [amount, setAmount] = useState<string>(expense ? String(expense.amount) : "");
  const [expenseDate, setExpenseDate] = useState<string>(
    expense?.expenseDate || new Date().toISOString().split("T")[0]
  );
  const [paidBy, setPaidBy] = useState<string>(
    expense?.paidBy || (user?.role === "organizer" ? "Organizer" : user?.name || "Sahayak")
  );
  const [description, setDescription] = useState<string>(expense?.description || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0 || !paidBy.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        category,
        amount: numAmount,
        expenseDate,
        paidBy: paidBy.trim(),
        description: description.trim(),
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEditing ? "Edit Expense" : "Add New Expense"}
      subtitle="Record yatra expense with category and payer accountability"
      onClose={onClose}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Expense Category <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {EXPENSE_CATEGORIES.map((cat) => (
              <button
                key={cat.category}
                type="button"
                onClick={() => setCategory(cat.category)}
                className={`p-2 rounded-xl text-xs font-bold border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  category === cat.category
                    ? "bg-orange-600 text-white border-orange-700 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span className="truncate w-full">{cat.category.split("/")[0].trim()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Expense Amount (₹) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="8000"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Paid By */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Paid By <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              placeholder="Organizer / Rahul"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex gap-2 mt-1.5">
            <button
              type="button"
              onClick={() => setPaidBy("Organizer")}
              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
            >
              Organizer
            </button>
            <button
              type="button"
              onClick={() => setPaidBy(user?.name || "Sahayak")}
              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
            >
              Me ({user?.name?.split(" ")[0] || "User"})
            </button>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Expense Date
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="date"
              required
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Description / Item Details <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bus advance payment receipt, diesel 50 liters..."
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !amount || Number(amount) <= 0 || !paidBy.trim()}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 text-white text-sm font-bold shadow-md shadow-orange-950/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            <span>{loading ? "Saving..." : isEditing ? "Save Changes" : "Save Expense"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
