"use client";

import React, { useState, useMemo } from "react";
import {
  IndianRupee,
  Search,
  PlusCircle,
  Trash2,
  Filter,
  Calendar,
  CreditCard,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { useYatraData } from "@/context/YatraContext";
import { useAuth } from "@/context/AuthContext";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { inr, getPaymentMethodTotals } from "@/lib/calculations";
import { formatDate } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/constants";
import type { PaymentMethod } from "@/types/yatra";

interface PaymentsViewProps {
  onAddPayment: () => void;
}

export function PaymentsView({ onAddPayment }: PaymentsViewProps) {
  const { members, payments, summary, removePayment } = useYatraData();
  const { isOrganizer } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<"All" | PaymentMethod>("All");
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

  const methodTotals = useMemo(() => getPaymentMethodTotals(payments), [payments]);

  // Filtered payments list (sorted latest first)
  const filteredPayments = useMemo(() => {
    return [...payments]
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .filter((p) => {
        const member = members.find((m) => m.id === p.memberId);
        const memberName = member?.name || "";
        const memberPhone = member?.phone || "";

        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          memberName.toLowerCase().includes(query) ||
          memberPhone.includes(query) ||
          (p.note && p.note.toLowerCase().includes(query)) ||
          String(p.amount).includes(query);

        const matchesMethod = methodFilter === "All" || p.paymentMethod === methodFilter;

        return matchesSearch && matchesMethod;
      });
  }, [payments, members, searchQuery, methodFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              Payments Ledger
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              {payments.length} Transactions
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Every payment is recorded as an individual transaction for transparent accounting.
          </p>
        </div>

        <button
          onClick={onAddPayment}
          className="py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-xs md:text-sm shadow-md shadow-emerald-900/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <IndianRupee className="w-4 h-4" />
          <span>+ Record Payment</span>
        </button>
      </div>

      {/* Payment Method Distribution Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {methodTotals.map((mt) => (
          <div
            key={mt.method}
            onClick={() => setMethodFilter(methodFilter === mt.method ? "All" : mt.method)}
            className={`p-3.5 rounded-2xl border transition cursor-pointer ${
              methodFilter === mt.method
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-xs"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold">{mt.method}</span>
              <span className="text-[10px] font-semibold opacity-80">{mt.count} txns</span>
            </div>
            <p className="text-base font-black text-slate-900 dark:text-white">
              {inr(mt.total)}
            </p>
          </div>
        ))}
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by member name, amount, or payment note..."
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

        {/* Method Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setMethodFilter("All")}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
              methodFilter === "All"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
            }`}
          >
            All Methods ({payments.length})
          </button>
          {PAYMENT_METHODS.map((pm) => (
            <button
              key={pm.method}
              onClick={() => setMethodFilter(pm.method)}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                methodFilter === pm.method
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <span>{pm.icon}</span>
              <span>{pm.method}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
            🧾
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white text-base">
            No payment records found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No transactions matching "${searchQuery}".`
              : "No payments recorded yet. Click '+ Record Payment' to record a fare."}
          </p>
          <button
            onClick={onAddPayment}
            className="mt-2 py-2 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
          >
            + Record Payment
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filteredPayments.map((p) => {
            const member = members.find((m) => m.id === p.memberId);
            return (
              <div
                key={p.id}
                className="p-4 md:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black text-base flex items-center justify-center shadow-xs shrink-0">
                    ₹
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {member?.name || "Unknown Member"}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {p.paymentMethod}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDate(p.paymentDate)}
                      </span>
                      {p.note && (
                        <span>• &ldquo;{p.note}&rdquo;</span>
                      )}
                      {p.createdByName && (
                        <span className="text-slate-500">• Collected by: {p.createdByName}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base md:text-lg font-black text-emerald-600 dark:text-emerald-400">
                    +{inr(p.amount)}
                  </span>

                  {isOrganizer && (
                    <button
                      onClick={() => setPaymentToDelete(p.id)}
                      title="Delete payment"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Payment Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(paymentToDelete)}
        title="Delete Payment Record"
        message="Are you sure you want to remove this payment entry? The member's remaining due amount will be updated automatically."
        confirmLabel="Delete"
        onConfirm={() => {
          if (paymentToDelete) {
            removePayment(paymentToDelete);
            setPaymentToDelete(null);
          }
        }}
        onClose={() => setPaymentToDelete(null)}
      />
    </div>
  );
}
