"use client";

import   { useState } from "react";
import {
  Receipt,
  IndianRupee,
  UserPlus,
  Settings,
  ChevronDown,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useYatraData } from "@/context/YatraContext";
import { RoleBadge } from "../common/Badge";
import { canEditYatra, canAddPayment, canAddExpense, canAddMember } from "@/lib/permissions";

interface HeaderProps {
  onAddPayment: () => void;
  onAddExpense: () => void;
  onAddMember: () => void;
  onOpenSettings: () => void;
}

export function Header({
  onAddPayment,
  onAddExpense,
  onAddMember,
  onOpenSettings,
}: HeaderProps) {
  const { user, logout, loginDemoOrganizer, loginDemoSahayak } = useAuth();
  const { activeYatra, userRole, isOrganizer, resetToSeedData } = useYatraData();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-3.5 flex items-center justify-between transition-all">
      {/* Left: Active Yatra summary & Mobile brand */}
      <div className="flex items-center gap-3">
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-base shadow-sm">
            🚩
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base md:text-xl font-extrabold text-slate-900 dark:text-white truncate max-w-[200px] md:max-w-md">
              {activeYatra?.name || "YatraSetu"}
            </h2>
            {activeYatra && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                ₹{activeYatra.fare.toLocaleString("en-IN")} / Member
              </span>
            )}
          </div>

          {activeYatra && (
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-2 mt-0.5">
              <span>{activeYatra.startPlace} ➔ {activeYatra.destination}</span>
              <span>•</span>
              <span>{activeYatra.startDate} to {activeYatra.endDate}</span>
            </p>
          )}
        </div>
      </div>

      {/* Right: Quick Action Buttons & Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick Add Buttons */}
        {activeYatra && (
          <>
            {canAddPayment(userRole) && (
              <button
                onClick={onAddPayment}
                className="hidden sm:flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Payment</span>
              </button>
            )}

            {canAddExpense(userRole) && (
              <button
                onClick={onAddExpense}
                className="hidden sm:flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Expense</span>
              </button>
            )}

            {canAddMember(userRole) && (
              <button
                onClick={onAddMember}
                className="hidden md:flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Member</span>
              </button>
            )}

            {canEditYatra(userRole) && (
              <button
                onClick={onOpenSettings}
                title="Yatra Settings"
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </>
        )}

        {/* User profile dropdown trigger */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-xs">
              {user?.name?.substring(0, 2).toUpperCase() || "US"}
            </div>
            <div className="hidden lg:block text-left">
              <span className="block text-xs font-bold text-slate-800 dark:text-white leading-tight">
                {user?.name?.split(" ")[0] || "User"}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User dropdown menu */}
          {showUserMenu && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1.5">
                  <RoleBadge role={userRole === "sahayak" ? "sahayak" : "organizer"} />
                </div>
              </div>

              <div className="py-1">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Active Role
                </div>
                <button
                  onClick={() => {
                    loginDemoOrganizer();
                    setShowUserMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    isOrganizer
                      ? "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>👑 Admin</span>
                  {isOrganizer && <span className="text-amber-600">✓</span>}
                </button>

                <button
                  onClick={() => {
                    loginDemoSahayak();
                    setShowUserMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    !isOrganizer
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-bold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>🤝 Manager</span>
                  {!isOrganizer && <span className="text-emerald-600">✓</span>}
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <button
                  onClick={() => {
                    resetToSeedData();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Local Storage</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 font-semibold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
