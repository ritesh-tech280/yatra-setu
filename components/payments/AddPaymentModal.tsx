"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import {
  IndianRupee,
  User,
  Calendar,
  FileText,
  AlertCircle,
  Zap,
} from "lucide-react";
import type { Member, PaymentMethod } from "@/types/yatra";
import { useYatraData } from "@/context/YatraContext";
import { getMemberBalance, inr, validatePaymentAmount } from "@/lib/calculations";
import { PAYMENT_METHODS } from "@/lib/constants";

interface AddPaymentModalProps {
  initialMember?: Member | null;
  onClose: () => void;
}

export function AddPaymentModal({ initialMember, onClose }: AddPaymentModalProps) {
  const { activeYatra, members, payments, recordPayment } = useYatraData();
  const fare = activeYatra?.fare || 0;

  const [selectedMemberId, setSelectedMemberId] = useState<string>(initialMember?.id || "");
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string>("");

  const currentMember = members.find((m) => m.id === selectedMemberId);
  const balance = currentMember ? getMemberBalance(currentMember.id, payments, fare) : null;

  // Auto-validate whenever amount or member changes
  useEffect(() => {
    if (!selectedMemberId || !amount) {
      setValidationError("");
      return;
    }
    const numAmount = Number(amount);
    const result = validatePaymentAmount(selectedMemberId, numAmount, payments, fare);
    if (!result.valid) {
      setValidationError(result.error || "");
    } else {
      setValidationError("");
    }
  }, [selectedMemberId, amount, payments, fare]);

  // One-click quick fill full remaining amount
  const handleFillFull = () => {
    if (balance && balance.remaining > 0) {
      setAmount(String(balance.remaining));
      setValidationError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    const numAmount = Number(amount);
    const result = validatePaymentAmount(selectedMemberId, numAmount, payments, fare);
    if (!result.valid) {
      setValidationError(result.error || "Invalid payment amount.");
      return;
    }

    setLoading(true);
    try {
      const res = await recordPayment({
        memberId: selectedMemberId,
        amount: numAmount,
        paymentMethod,
        paymentDate,
        note: note.trim(),
      });
      if (res) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Record Payment"
      subtitle="Fast 1-tap member fare payment entry"
      onClose={onClose}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Select Member */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Select Member <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <select
              required
              value={selectedMemberId}
              onChange={(e) => {
                setSelectedMemberId(e.target.value);
                setAmount("");
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              <option value="">-- Select Member --</option>
              {members.map((m) => {
                const b = getMemberBalance(m.id, payments, fare);
                return (
                  <option key={m.id} value={m.id} disabled={b.remaining <= 0}>
                    {m.name} ({m.phone}) — {b.remaining > 0 ? `${inr(b.remaining)} Due` : "✓ Fully Paid"}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Selected Member Balance Summary Card */}
        {balance && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Current Status</p>
              <p className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">
                Paid: <strong className="text-emerald-600">{inr(balance.paid)}</strong> of {inr(fare)}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-rose-500">Remaining Due</span>
              <p className="text-base font-black text-rose-600 dark:text-rose-400">
                {inr(balance.remaining)}
              </p>
            </div>

            {balance.remaining > 0 && (
              <button
                type="button"
                onClick={handleFillFull}
                className="py-1.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 text-xs font-black flex items-center gap-1 shadow-xs transition cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Pay Full</span>
              </button>
            )}
          </div>
        )}

        {/* Amount Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Amount (₹) <span className="text-rose-500">*</span>
            </label>
            {balance && balance.remaining > 0 && (
              <button
                type="button"
                onClick={handleFillFull}
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Full Due ({inr(balance.remaining)})
              </button>
            )}
          </div>

          <div className="relative">
            <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="number"
              min="1"
              max={balance?.remaining || fare}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter the Amount"
              className={`w-full pl-10 pr-3 py-2.5 rounded-xl border ${
                validationError
                  ? "border-rose-500 bg-rose-50/20 text-rose-900 dark:text-rose-200"
                  : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              } text-base font-bold focus:outline-none focus:border-amber-500`}
            />
          </div>

          {/* Validation Error Message */}
          {validationError && (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{validationError}</span>
            </p>
          )}
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Payment Method
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.method}
                type="button"
                onClick={() => setPaymentMethod(pm.method)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition flex flex-col items-center gap-1 text-center cursor-pointer ${
                  paymentMethod === pm.method
                    ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
              >
                
                <span>{pm.method}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Payment Date
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Optional Note */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Remark / Reference <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Received at camp"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Submit */}
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
            disabled={loading || Boolean(validationError) || !amount || !selectedMemberId}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 text-white text-sm font-bold shadow-md shadow-emerald-900/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <IndianRupee className="w-4 h-4" />
            <span>{loading ? "Saving..." : `Record ${amount ? inr(Number(amount)) : "Payment"}`}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
