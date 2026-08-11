"use client";

import {
  Users,
  IndianRupee,
  Receipt,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useYatraData } from "@/context/YatraContext";
import { useAuth } from "@/context/AuthContext";
import { StatCard } from "../common/StatCard";
import { ProgressDonut } from "./ProgressDonut";
import { inr } from "@/lib/calculations";
import { formatDate } from "@/lib/utils";
import type { NavTab } from "../layout/Sidebar";

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onAddPayment: () => void;
  onAddExpense: () => void;
  onAddMember: () => void;
}

export function DashboardView({
  onNavigate,
  onAddPayment,
  onAddExpense,
  onAddMember,
}: DashboardViewProps) {
  const { user } = useAuth();
  const { activeYatra, members, payments, expenses, summary, getMemberStatus } = useYatraData();

  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.createdAt || b.paymentDate).getTime() - new Date(a.createdAt || a.paymentDate).getTime())
    .slice(0, 4);

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.createdAt || b.expenseDate).getTime() - new Date(a.createdAt || a.expenseDate).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-slate-700/50">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 translate-y-12 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeYatra?.name || "Overview"}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Welcome, {user?.name || "Admin"}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Live financial overview and transparent member ledger for your Travel group.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onAddPayment}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-xs md:text-sm shadow-lg shadow-emerald-950/30 active:scale-95 transition flex items-center gap-2 cursor-pointer"
            >
              <IndianRupee className="w-4 h-4" />
              <span>Record Payment</span>
            </button>
            <button
              onClick={onAddExpense}
              className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs md:text-sm border border-white/20 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-3.5 md:gap-4">
        {/* Total Members */}
        <StatCard
          label="Total Members"
          value={summary.totalMembers}
          hint={`₹${activeYatra?.fare.toLocaleString("en-IN")} per member`}
          tone="amber"
          icon={<Users className="w-5 h-5" />}
          onClick={() => onNavigate("members")}
        />

        {/* Expected Collection */}
        <StatCard
          label="Expected Total"
          value={inr(summary.expected)}
          hint={`${summary.totalMembers} × ${inr(activeYatra?.fare || 0)}`}
          tone="sky"
          icon={<ArrowUpRight className="w-5 h-5" />}
        />

        {/* Total Collected */}
        <StatCard
          label="Total Collected"
          value={inr(summary.collected)}
          hint={
            summary.contributions > 0
              ? `${inr(summary.memberCollected)} fares + ${inr(summary.contributions)} donations`
              : `${summary.collectionPercentage}% of target`
          }
          tone="emerald"
          icon={<IndianRupee className="w-5 h-5" />}
          onClick={() => onNavigate("payments")}
        />

        {/* Outstanding Dues */}
        <StatCard
          label="Outstanding Dues"
          value={inr(summary.outstanding)}
          hint={`${summary.partial + summary.pending} members pending`}
          tone="rose"
          icon={<Clock className="w-5 h-5" />}
          onClick={() => onNavigate("members")}
        />

        {/* Total Expenses */}
        <StatCard
          label="Total Expenses"
          value={inr(summary.expenses)}
          hint={`${expenses.length} bills recorded`}
          tone="orange"
          icon={<Receipt className="w-5 h-5" />}
          onClick={() => onNavigate("expenses")}
        />

        {/* Current Balance */}
        <StatCard
          label="Net Balance"
          value={inr(summary.balance)}
          hint={summary.balance >= 0 ? "Safe treasury" : "Deficit (Expenses > Income)"}
          tone={summary.balance >= 0 ? "purple" : "rose"}
          icon={<Wallet className="w-5 h-5" />}
          onClick={() => onNavigate("report")}
        />
      </div>

      {/* Main 2-Column Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Collection Progress & Status */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Collection Status
              </p>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Fare Collection Breakdown
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {summary.full} of {summary.totalMembers} Fully Paid
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
            <div className="flex flex-col items-center">
              <ProgressDonut percentage={summary.collectionPercentage} label="Collected" size={150} />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">
                Member Target: {summary.collectionPercentage}%
              </p>
            </div>

            {/* Member status counts */}
            <div className="space-y-3 w-full sm:w-60">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    Fully Paid
                  </span>
                </div>
                <span className="text-sm font-black text-emerald-800 dark:text-emerald-200">
                  {summary.full} <span className="text-xs font-medium text-slate-500">/ {summary.totalMembers}</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                    Partial Paid
                  </span>
                </div>
                <span className="text-sm font-black text-amber-800 dark:text-amber-200">
                  {summary.partial} <span className="text-xs font-medium text-slate-500">/ {summary.totalMembers}</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-300">
                    Payment Pending
                  </span>
                </div>
                <span className="text-sm font-black text-rose-800 dark:text-rose-200">
                  {summary.pending} <span className="text-xs font-medium text-slate-500">/ {summary.totalMembers}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">
              <strong>{summary.full}</strong> of <strong>{summary.totalMembers}</strong> members have paid in full.
            </span>
            <button
              onClick={() => onNavigate("members")}
              className="font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
            >
              Manage Members →
            </button>
          </div>
        </div>

        {/* Right Col: Expense vs Income Progress */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Treasury Health
                </p>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Budget Utilization
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {expenses.length} Records
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                    Net Available in Treasury
                  </span>
                  <p
                    className={`text-2xl font-black mt-0.5 ${
                      summary.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
                    }`}
                  >
                    {inr(summary.balance)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                  💼
                </div>
              </div>

              {/* Progress Bar for Expense vs Collected */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500">Total Inflow</span>
                  <span className="text-slate-900 dark:text-white font-bold">{inr(summary.collected)}</span>
                </div>
                {summary.contributions > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Includes external donations</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">+{inr(summary.contributions)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500">Total Spent</span>
                  <span className="text-slate-900 dark:text-white font-bold">{inr(summary.expenses)}</span>
                </div>

                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      summary.expensePercentage > 90 ? "bg-rose-500" : "bg-purple-500"
                    }`}
                    style={{ width: `${Math.min(summary.expensePercentage, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Expenses are <strong>{summary.expensePercentage}%</strong> of collected funds
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate("report")}
            className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span>Open Complete Financial Audit Report →</span>
          </button>
        </div>
      </div>

      {/* Bottom Section: Recent Activity Ledger & Quick Add */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Payments */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>🧾 Latest Payments & Contributions</span>
            </h3>
            <button
              onClick={() => onNavigate("payments")}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
            >
              View All ({payments.length})
            </button>
          </div>

          {recentPayments.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No payments recorded yet. Click "+ Record Payment" to begin.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentPayments.map((p) => {
                const isContrib = Boolean(p.isContribution || !p.memberId);
                const member = !isContrib ? members.find((m) => m.id === p.memberId) : null;
                const displayName = isContrib ? (p.contributorName || "Donor") : (member?.name || "Member");

                return (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center ${
                          isContrib
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                            : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {isContrib ? "🎁" : "₹"}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {displayName}
                          </p>
                          {isContrib && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              Donation
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {formatDate(p.paymentDate)} • <span className="font-medium text-slate-500">{p.paymentMethod}</span>
                          {p.note && ` • "${p.note}"`}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      +{inr(p.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={onAddMember}
            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 text-slate-600 dark:text-slate-400 hover:text-amber-600 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>+ Add a new Member to group</span>
          </button>
        </div>

        {/* Recent Expenses */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>📦 Recent Expenses</span>
            </h3>
            <button
              onClick={() => onNavigate("expenses")}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
            >
              View All ({expenses.length})
            </button>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No expenses recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentExpenses.map((e) => (
                <div key={e.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-bold text-sm flex items-center justify-center">
                      ▣
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {e.category}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
                        Paid by {e.paidBy} • {formatDate(e.expenseDate)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-orange-600 dark:text-orange-400">
                    −{inr(e.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={onAddExpense}
            className="w-full py-2.5 px-4 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 hover:bg-orange-100 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>+ Record New Expense</span>
          </button>
        </div>
      </div>
    </div>
  );
}
