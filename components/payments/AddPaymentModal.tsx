"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import {
  IndianRupee,
  User,
  Phone,
  Calendar,
  FileText,
  AlertCircle,
  Zap,
  Gift,
  Users,
  Sparkles,
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

  const [paymentType, setPaymentType] = useState<"member" | "contribution">(
    initialMember ? "member" : "member"
  );
  const [selectedMemberId, setSelectedMemberId] = useState<string>(initialMember?.id || "");
  const [contributorName, setContributorName] = useState<string>("");
  const [contributorPhone, setContributorPhone] = useState<string>("");
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
    if (paymentType === "contribution") {
      if (!amount) {
        setValidationError("");
        return;
      }
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        setValidationError("Amount must be greater than ₹0.");
      } else {
        setValidationError("");
      }
      return;
    }

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
  }, [paymentType, selectedMemberId, amount, payments, fare]);

  // One-click quick fill full remaining amount for member
  const handleFillFull = () => {
    if (balance && balance.remaining > 0) {
      setAmount(String(balance.remaining));
      setValidationError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setValidationError("Please enter a valid amount greater than ₹0.");
      return;
    }

    if (paymentType === "contribution") {
      if (!contributorName.trim()) {
        setValidationError("Contributor / Donor name is required.");
        return;
      }

      setLoading(true);
      try {
        const res = await recordPayment({
          isContribution: true,
          contributorName: contributorName.trim(),
          contributorPhone: contributorPhone.trim(),
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
      return;
    }

    // Member Payment
    if (!selectedMemberId) {
      setValidationError("Please select a member.");
      return;
    }

    const result = validatePaymentAmount(selectedMemberId, numAmount, payments, fare);
    if (!result.valid) {
      setValidationError(result.error || "Invalid payment amount.");
      return;
    }

    setLoading(true);
    try {
      const res = await recordPayment({
        memberId: selectedMemberId,
        isContribution: false,
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

  const isFormValid =
    !loading &&
    !validationError &&
    Boolean(amount) &&
    Number(amount) > 0 &&
    (paymentType === "contribution" ? Boolean(contributorName.trim()) : Boolean(selectedMemberId));

  return (
    <Modal
      title="Record Payment / Collection"
      subtitle="Record member fares or external donor contributions"
      onClose={onClose}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector: Member vs External Contribution */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => {
              setPaymentType("member");
              setValidationError("");
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              paymentType === "member"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-500" />
            <span>Member Fare</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPaymentType("contribution");
              setValidationError("");
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              paymentType === "contribution"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-emerald-500" />
            <span>External Contribution</span>
          </button>
        </div>

        {/* Member Mode Form Fields */}
        {paymentType === "member" && (
          <>
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
          </>
        )}

        {/* Contribution Mode Form Fields */}
        {paymentType === "contribution" && (
          <div className="space-y-3.5">
            <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                Record financial contribution, or donation from someone who is <strong>not a member</strong> of this trip. It will be added to collected funds without increasing expected member fares.
              </p>
            </div>

            {/* Contributor Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Donor Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  placeholder="Enter donor name"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Contributor Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number <span className="text-slate-400 font-normal">(Optional, for WhatsApp receipt)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={contributorPhone}
                  onChange={(e) => setContributorPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {paymentType === "contribution" ? "Contribution Amount (₹)" : "Amount (₹)"} <span className="text-rose-500">*</span>
            </label>
            {paymentType === "member" && balance && balance.remaining > 0 && (
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
              max={paymentType === "member" ? (balance?.remaining || fare) : undefined}
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
            {paymentType === "contribution" ? "Purpose / Remark" : "Remark / Reference"}{" "}
            <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                paymentType === "contribution"
                  ? "Enter remark if any"
                  : "Enter remark or reference if any"
              }
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 text-white text-sm font-bold shadow-md shadow-emerald-900/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {paymentType === "contribution" ? <Gift className="w-4 h-4" /> : <IndianRupee className="w-4 h-4" />}
            <span>
              {loading
                ? "Saving..."
                : paymentType === "contribution"
                ? `Add ${amount ? inr(Number(amount)) : "Payment"}`
                : `Add ${amount ? inr(Number(amount)) : "Payment"}`}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
