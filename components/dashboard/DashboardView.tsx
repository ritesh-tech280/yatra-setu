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
              <span>{activeYatra?.name || "Yatra Overview"}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Welcome, {user?.name || "Organizer"}
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
          hint={`${summary.collectionPercentage}% of target`}
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
            <button
              onClick={() => onNavigate("payments")}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              View Payments <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Donut Chart */}
            <div className="sm:col-span-5 flex justify-center py-2">
              <ProgressDonut percentage={summary.collectionPercentage} label="Collected" size={150} />
            </div>

            {/* Status Breakdown Legend */}
            <div className="sm:col-span-7 space-y-3">
              {/* Fully Paid */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                      Fully Paid
                    </p>
                    <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400">
                      Zero balance remaining
                    </p>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                  {summary.full} <span className="text-xs font-medium text-slate-500">/ {summary.totalMembers}</span>
                </span>
              </div>

              {/* Partial */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-950 dark:text-amber-200">
                      Partially Paid
                    </p>
                    <p className="text-[10px] text-amber-700/80 dark:text-amber-400">
                      Partially paid advance
                    </p>
                  </div>
                </div>
                <span className="text-sm font-black text-amber-700 dark:text-amber-300">
                  {summary.partial} <span className="text-xs font-medium text-slate-500">/ {summary.totalMembers}</span>
                </span>
              </div>

              {/* Pending */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-rose-950 dark:text-rose-200">
                      Pending
                    </p>
                    <p className="text-[10px] text-rose-700/80 dark:text-rose-400">
                      Full fare amount due
                    </p>
                  </div>
                </div>
                <span className="text-sm font-black text-rose-700 dark:text-rose-300">
                  {summary.pending} <span className="text-xs font-medium text-slate-500">/ {summary.totalMembers}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span>
              <strong>{summary.full}</strong> of <strong>{summary.totalMembers}</strong> members have paid in full.
            </span>
            <button
              onClick={() => onNavigate("members")}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
            >
              View Member List →
            </button>
          </div>
        </div>

        {/* Right Col: Current Treasury & Expenses Ratio */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Treasury Balance
                </p>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Net Balance
                </h2>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                Income − Expenses
              </span>
            </div>

            {/* Big Balance Display */}
            <div className="my-6">
              <span className="text-xs text-slate-500 uppercase font-semibold">Available Funds</span>
              <h3 className={`text-4xl font-black tracking-tight mt-1 ${
                summary.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
              }`}>
                {inr(summary.balance)}
              </h3>
            </div>

            {/* Income vs Expenses breakdown bars */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Total Collected
                </span>
                <span className="text-slate-900 dark:text-white font-bold">{inr(summary.collected)}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500" /> Total Expenses
                </span>
                <span className="text-slate-900 dark:text-white font-bold">{inr(summary.expenses)}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(summary.expensePercentage, 100)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 text-right">
                Expenses are <strong>{summary.expensePercentage}%</strong> of collected funds
              </p>
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
              <span>🧾 Latest Payments</span>
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
                const member = members.find((m) => m.id === p.memberId);
                return (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black text-sm flex items-center justify-center">
                        ₹
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {member?.name || "Member"}
                        </p>
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
