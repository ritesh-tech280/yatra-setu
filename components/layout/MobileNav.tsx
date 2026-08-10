"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  IndianRupee,
  Receipt,
  FileSpreadsheet,
  Plus,
  UserPlus,
  ShieldCheck,
  X,
} from "lucide-react";
import type { NavTab } from "./Sidebar";
import { useYatraData } from "@/context/YatraContext";
import { canManageSahayaks } from "@/lib/permissions";

interface MobileNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onAddPayment: () => void;
  onAddExpense: () => void;
  onAddMember: () => void;
  onAddSahayak: () => void ;
}

export function MobileNav({
  activeTab,
  onSelectTab,
  onAddPayment,
  onAddExpense,
  onAddMember,
  onAddSahayak,
}: MobileNavProps) {
  const { userRole } = useYatraData();
  const [showQuickActions, setShowQuickActions] = useState(false);

  return (
    <>
      {/* Quick Action Bottom Sheet / Floating Menu for Mobile */}
      {showQuickActions && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs flex flex-col justify-end p-4 animate-in fade-in duration-200 lg:hidden"
          onClick={() => setShowQuickActions(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3 mb-16 animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Quick Action
              </h3>
              <button
                onClick={() => setShowQuickActions(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  onAddPayment();
                }}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs gap-2 active:scale-95 transition shadow-xs cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <span>+ Payment</span>
              </button>

              <button
                onClick={() => {
                  setShowQuickActions(false);
                  onAddExpense();
                }}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300 font-bold text-xs gap-2 active:scale-95 transition shadow-xs cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <span>+ Expense</span>
              </button>

              <button
                onClick={() => {
                  setShowQuickActions(false);
                  onAddMember();
                }}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold text-xs gap-2 active:scale-95 transition shadow-xs cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                  <UserPlus className="w-5 h-5" />
                </div>
                <span>+ Member</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Nav Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {/* Dashboard */}
        <button
          onClick={() => onSelectTab("dashboard")}
          className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition cursor-pointer ${
            activeTab === "dashboard"
              ? "text-amber-600 dark:text-amber-400 font-extrabold scale-105"
              : "text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Dashboard</span>
        </button>

        {/* Members */}
        <button
          onClick={() => onSelectTab("members")}
          className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-xl transition cursor-pointer ${
            activeTab === "members"
              ? "text-amber-600 dark:text-amber-400 font-extrabold scale-105"
              : "text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900"
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Members</span>
        </button>

        {/* Center Quick Action Floating Trigger */}
        <div className="relative -top-3">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 border-2 border-white dark:border-slate-900 active:scale-95 transition cursor-pointer"
            aria-label="Quick Action"
          >
            <Plus className={`w-6 h-6 transition-transform ${showQuickActions ? "rotate-45" : ""}`} />
          </button>
        </div>

        {/* Sahayak for Organizer, Payments for Sahayak */}
        {canManageSahayaks(userRole) ? (
          <button
            onClick={() => onSelectTab("sahayaks")}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition cursor-pointer ${
              activeTab === "sahayaks"
                ? "text-amber-600 dark:text-amber-400 font-extrabold scale-105"
                : "text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px]">Manager</span>
          </button>
        ) : (
          <button
            onClick={() => onSelectTab("payments")}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition cursor-pointer ${
              activeTab === "payments"
                ? "text-amber-600 dark:text-amber-400 font-extrabold scale-105"
                : "text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900"
            }`}
          >
            <IndianRupee className="w-5 h-5" />
            <span className="text-[10px]">Payments</span>
          </button>
        )}

        {/* Report */}
        <button
          onClick={() => onSelectTab("report")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === "report"
              ? "text-amber-600 dark:text-amber-400 font-extrabold scale-105"
              : "text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900"
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span className="text-[10px]">Report</span>
        </button>
      </nav>
    </>
  );
}
