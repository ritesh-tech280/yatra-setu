"use client";

import React, { useState, useMemo } from "react";
import {
  Printer,
  Download,
  FileSpreadsheet,
  MapPin,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  IndianRupee,
  Receipt,
  Scale,
  Building,
} from "lucide-react";
import { useYatraData } from "@/context/YatraContext";
import { inr, getMemberBalance, getCategoryTotals, getPaymentMethodTotals } from "@/lib/calculations";
import { formatDate } from "@/lib/utils";
import { generatePdfFromElement } from "@/lib/pdfGenerator";
import { useToast } from "@/context/ToastContext";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

export function ReportView() {
  const { activeYatra, members, payments, expenses, summary } = useYatraData();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const fare = activeYatra?.fare || 0;
  const categoryTotals = useMemo(() => getCategoryTotals(expenses), [expenses]);
  const methodTotals = useMemo(() => getPaymentMethodTotals(payments), [payments]);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    toast("Generating PDF report...", "info");
    try {
      const fileName = `${(activeYatra?.name || "yatra").toLowerCase().replace(/\s+/g, "-")}-financial-report.pdf`;
      const success = await generatePdfFromElement("yatra-final-report", fileName);
      if (success) {
        toast("PDF downloaded successfully!", "success");
      } else {
        toast("Could not download PDF. You can also use Print Report -> Save as PDF.", "warning");
      }
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              Final Financial Audit Report
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              Audited Summary
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete member-wise collection ledger, category expenses, and transparent final treasury balance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-500" />
            <span>{downloading ? "Generating PDF..." : "Download PDF"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs shadow-md shadow-orange-950/20 active:scale-95 transition flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Container */}
      <div
        id="yatra-final-report"
        className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-lg space-y-8 print:p-0 print:border-none print:shadow-none print:rounded-none"
      >
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider mb-2">
                <span>Official Financial Report</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
                {activeYatra?.name || "Yatra Group"}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Route: {activeYatra?.startPlace} ➔ {activeYatra?.destination}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dates: {activeYatra?.startDate} to {activeYatra?.endDate}</span>
                </span>
                <span>•</span>
                <span>Admin: <strong>{activeYatra?.organizerName}</strong></span>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6">
              <span className="text-[10px] font-bold uppercase text-slate-400">Standard Fare</span>
              <p className="text-2xl font-black text-slate-900 mt-0.5">
                {inr(activeYatra?.fare || 0)}
              </p>
              <p className="text-[11px] font-medium text-slate-500">per registered Member</p>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Yatra Summary (4 KPI Boxes) */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
            1. Executive Yatra Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Expected Collection */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Expected Collection
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">
                {inr(summary.expected)}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {summary.totalMembers} members × {inr(fare)}
              </p>
            </div>

            {/* Total Collected */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Total Collected
              </span>
              <p className="text-xl font-black text-emerald-800 mt-1">
                {inr(summary.collected)}
              </p>
              <p className="text-[10px] text-emerald-700 mt-1">
                {summary.collectionPercentage}% of total target
              </p>
            </div>

            {/* Total Expenses */}
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-800">
                Total Expenses
              </span>
              <p className="text-xl font-black text-orange-800 mt-1">
                {inr(summary.expenses)}
              </p>
              <p className="text-[10px] text-orange-700 mt-1">
                {expenses.length} expense entries
              </p>
            </div>

            {/* Current Balance */}
            <div className={`p-4 rounded-2xl border ${
              summary.balance >= 0 ? "bg-purple-50 border-purple-200" : "bg-rose-50 border-rose-200"
            }`}>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                summary.balance >= 0 ? "text-purple-800" : "text-rose-800"
              }`}>
                Current Balance
              </span>
              <p className={`text-xl font-black mt-1 ${
                summary.balance >= 0 ? "text-purple-900" : "text-rose-900"
              }`}>
                {inr(summary.balance)}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Total Collected − Total Expenses
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Member Payment Report */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              2. Member Payment Report
            </h3>
            <span className="text-xs font-bold text-slate-600">
              {summary.totalMembers} Members • Fully Paid: {summary.full} • Partial: {summary.partial} • Pending: {summary.pending}
            </span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4 text-right">Expected Fare</th>
                  <th className="py-3 px-4 text-right">Total Paid</th>
                  <th className="py-3 px-4 text-right">Remaining Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m, idx) => {
                  const b = getMemberBalance(m.id, payments, fare);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-4 text-center text-slate-400 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {m.name}
                        {m.notes && <span className="block text-[10px] text-slate-400 font-normal">{m.notes}</span>}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">
                        {m.phone}
                      </td>
                      <td className="py-2.5 px-4 text-right font-medium text-slate-600">
                        {inr(fare)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-700">
                        {inr(b.paid)}
                      </td>
                      <td className={`py-2.5 px-4 text-right font-bold ${
                        b.remaining > 0 ? "text-rose-600" : "text-slate-400"
                      }`}>
                        {inr(b.remaining)}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          b.status === "Fully Paid"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : b.status === "Partial"
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : "bg-rose-100 text-rose-800 border-rose-300"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 text-slate-900 font-black border-t-2 border-slate-300">
                  <td colSpan={3} className="py-3 px-4 text-right uppercase tracking-wider">
                    Total:
                  </td>
                  <td className="py-3 px-4 text-right">{inr(summary.expected)}</td>
                  <td className="py-3 px-4 text-right text-emerald-700">{inr(summary.collected)}</td>
                  <td className="py-3 px-4 text-right text-rose-700">{inr(summary.outstanding)}</td>
                  <td className="py-3 px-4 text-center text-slate-600">
                    {summary.full}/{summary.totalMembers} Paid
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Section 3: Expense Report by Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Expense Breakdown */}
          <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Receipt className="w-4 h-4 text-orange-600" />
              <span>3. Expense Report by Category</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {categoryTotals.map((ct) => (
                <div key={ct.category} className="flex items-center justify-between py-1 border-b border-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{ct.category}</span>
                    <span className="text-[10px] text-slate-400">({ct.count} entries)</span>
                  </div>
                  <span className="font-black text-slate-900">{inr(ct.total)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t-2 border-slate-900 font-black text-sm text-orange-800">
                <span>Total Expenses:</span>
                <span>{inr(summary.expenses)}</span>
              </div>
            </div>
          </div>

          {/* Final Summary & Treasury Balance */}
          <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
              <span>4. Final Summary & Treasury Balance</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Total Expected Collection</span>
                <span className="font-bold text-slate-900">{inr(summary.expected)}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Total Collected Amount</span>
                <span className="font-bold text-emerald-700">{inr(summary.collected)}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Outstanding Member Dues</span>
                <span className="font-bold text-rose-600">{inr(summary.outstanding)}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">Total Yatra Expenses</span>
                <span className="font-bold text-orange-700">{inr(summary.expenses)}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t-2 border-slate-900 font-black text-sm text-purple-900">
                <span>Final Balance:</span>
                <span className="text-base">{inr(summary.balance)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Signatures & Certification Footer */}
        <div className="pt-8 border-t border-slate-300 grid grid-cols-2 sm:grid-cols-3 gap-8 text-center text-xs">
          <div>
            <div className="h-12 border-b border-slate-400 border-dashed" />
            <p className="font-bold text-slate-800 mt-2">{activeYatra?.organizerName || "Admin"}</p>
            <p className="text-[10px] text-slate-500 uppercase">Admin</p>
          </div>

          <div>
            <div className="h-12 border-b border-slate-400 border-dashed" />
            <p className="font-bold text-slate-800 mt-2">Manager</p>
            <p className="text-[10px] text-slate-500 uppercase">Verification</p>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <div className="h-12 flex items-center justify-center text-emerald-800 font-black text-sm border-b border-slate-400 border-dashed">
              ✓ AUDITED
            </div>
            <p className="font-bold text-slate-800 mt-2">Generated on {formatDate(new Date().toISOString())}</p>
            <p className="text-[10px] text-slate-500 uppercase">Digital Ledger System</p>
          </div>
        </div>
      </div>
    </div>
  );
}
