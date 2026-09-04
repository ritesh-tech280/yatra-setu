"use client";

import React, { useState, useMemo } from "react";
import {
  Receipt,
  Search,
  PlusCircle,
  Trash2,
  Edit2,
  Calendar,
  UserCheck,
  Filter,
  Layers,
} from "lucide-react";
import { useYatraData } from "@/context/YatraContext";
import { useAuth } from "@/context/AuthContext";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { AddExpenseModal } from "./AddExpenseModal";
import { inr, getCategoryTotals } from "@/lib/calculations";
import { formatDate } from "@/lib/utils";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import type { Expense } from "@/types/yatra";

interface ExpensesViewProps {
  onAddExpense: () => void;
}

export function ExpensesView({ onAddExpense }: ExpensesViewProps) {
  const { expenses, summary, addNewExpense, editExpense, removeExpense } = useYatraData();
  const { isOrganizer } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const categoryTotals = useMemo(() => getCategoryTotals(expenses), [expenses]);

  // Filtered expenses (sorted latest first)
  const filteredExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime())
      .filter((e) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          e.category.toLowerCase().includes(query) ||
          e.paidBy.toLowerCase().includes(query) ||
          (e.description && e.description.toLowerCase().includes(query)) ||
          String(e.amount).includes(query);

        const matchesCat = categoryFilter === "All" || e.category === categoryFilter;

        return matchesSearch && matchesCat;
      });
  }, [expenses, searchQuery, categoryFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              Expenses & Bills
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300">
              Total: {inr(summary.expenses)}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track all collective Yatra expenditures with category breakdown and payer accountability.
          </p>
        </div>

        <button
          onClick={onAddExpense}
          className="py-3 px-5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-xs md:text-sm shadow-md shadow-orange-950/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Receipt className="w-4 h-4" />
          <span>Add New Expense</span>
        </button>
      </div>

      {/* Category Totals Breakdown */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 px-1">
          <Layers className="w-3.5 h-3.5 text-amber-500" />
          <span>Category-Wise Expense Summary</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categoryTotals.slice(0, 6).map((ct) => {
            const config = EXPENSE_CATEGORIES.find((c) => c.category === ct.category);
            return (
              <div
                key={ct.category}
                onClick={() => setCategoryFilter(categoryFilter === ct.category ? "All" : ct.category)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                  categoryFilter === ct.category
                    ? "bg-orange-50 dark:bg-orange-950/40 border-orange-500 shadow-xs"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{config?.icon || "📦"}</span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {ct.percentage}%
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                    {ct.category.split("/")[0]}
                  </p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {inr(ct.total)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by category, description, or paid by person..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white shadow-xs focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-3 text-xs font-bold text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded-md hover:bg-slate-100 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategoryFilter("All")}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
              categoryFilter === "All"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
            }`}
          >
            All Categories ({expenses.length})
          </button>
          {EXPENSE_CATEGORIES.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setCategoryFilter(cat.category)}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                categoryFilter === cat.category
                  ? "bg-orange-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.category.split("/")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
            📦
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white text-base">
            No expenses found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No expense entries matching "${searchQuery}".`
              : "No expenses recorded yet in this category. Click '+ Add New Expense' to record a bill."}
          </p>
          <button
            onClick={onAddExpense}
            className="mt-2 py-2 px-4 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition cursor-pointer"
          >
            + Add New Expense
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filteredExpenses.map((e) => {
            const catConfig = EXPENSE_CATEGORIES.find((c) => c.category === e.category);
            return (
              <div
                key={e.id}
                className="p-4 md:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-bold text-lg flex items-center justify-center shadow-xs shrink-0">
                    {catConfig?.icon || "📦"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {e.category}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        Paid by: {e.paidBy}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDate(e.expenseDate)}
                      </span>
                      {e.description && (
                        <span>• &ldquo;{e.description}&rdquo;</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base md:text-lg font-black text-orange-600 dark:text-orange-400">
                    {inr(e.amount)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setExpenseToEdit(e)}
                      title="Edit expense"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {isOrganizer && (
                      <button
                        onClick={() => setExpenseToDelete(e.id)}
                        title="Delete expense"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Expense Modal */}
      {expenseToEdit && (
        <AddExpenseModal
          expense={expenseToEdit}
          onClose={() => setExpenseToEdit(null)}
          onSubmit={async (data) => {
            await editExpense(expenseToEdit.id, data);
            setExpenseToEdit(null);
          }}
        />
      )}

      {/* Delete Expense Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(expenseToDelete)}
        title="Delete Expense Record"
        message="Are you sure you want to remove this expense record? The current treasury balance will be recalculated accordingly."
        confirmLabel="Delete Expense"
        onConfirm={() => {
          if (expenseToDelete) {
            removeExpense(expenseToDelete);
            setExpenseToDelete(null);
          }
        }}
        onClose={() => setExpenseToDelete(null)}
      />
    </div>
  );
}
