"use client";

import { useState } from "react";
import {
  Receipt,
  IndianRupee,
  UserPlus,
  Settings,
  ChevronDown,
  LogOut,
  RefreshCw,
  PlusCircle,
  ArrowLeftRight,
  Check,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useYatraData } from "@/context/YatraContext";
import { RoleBadge } from "../common/Badge";
import { canEditYatra, canAddPayment, canAddExpense, canAddMember } from "@/lib/permissions";
import { getYatraStatus } from "@/lib/calculations";
import { InstallPWAButton } from "@/components/pwa/InstallPWAButton";

interface HeaderProps {
  onAddPayment: () => void;
  onAddExpense: () => void;
  onAddMember: () => void;
  onOpenSettings: () => void;
  onOpenCreateEvent: () => void;
  onOpenSwitchEvent: () => void;
}

export function Header({
  onAddPayment,
  onAddExpense,
  onAddMember,
  onOpenSettings,
  onOpenCreateEvent,
  onOpenSwitchEvent,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const { activeYatra, yatras, switchYatra, userRole, isOrganizer, resetToSeedData } = useYatraData();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showEventMenu, setShowEventMenu] = useState(false);

  const activeStatus = getYatraStatus(activeYatra);

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 md:px-8 py-3 flex items-center justify-between transition-all">
      {/* Left: Active Event Switcher & Info */}
      <div className="flex items-center gap-3">
        <div className="lg:hidden flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-base shadow-sm">
            🚩
          </div>
        </div>

        {/* Interactive Event Dropdown Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEventMenu(!showEventMenu)}
            className="flex items-center gap-2 p-1.5 -ml-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition text-left cursor-pointer group"
          >
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm md:text-lg font-black text-slate-900 dark:text-white truncate max-w-[170px] sm:max-w-[260px] md:max-w-md group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                  {activeYatra?.name || "Select Event"}
                </h2>

                {activeYatra && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      activeStatus === "ongoing"
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                        : activeStatus === "completed"
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                        : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800"
                    }`}
                  >
                    {activeStatus === "ongoing" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                    {activeStatus === "ongoing"
                      ? "Running"
                      : activeStatus === "completed"
                      ? "Previous"
                      : "Upcoming"}
                  </span>
                )}

                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showEventMenu ? "rotate-180" : ""}`} />
              </div>

              {activeYatra && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-2 mt-0.5">
                  <span>
                    {activeYatra.startPlace} ➔ {activeYatra.destination}
                  </span>
                  <span>•</span>
                  <span>
                    ₹{activeYatra.fare.toLocaleString("en-IN")} / Person
                  </span>
                </p>
              )}
            </div>
          </button>

          {/* Quick Event Switcher Popover */}
          {showEventMenu && (
            <div
              className="absolute left-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              onMouseLeave={() => setShowEventMenu(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    Events & Trips
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Switch event to view separate data
                  </p>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {yatras.length} total
                </span>
              </div>

              {/* Action Button: Create New Event */}
              {isOrganizer && (
                <div className="p-1.5 border-b border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEventMenu(false);
                      onOpenCreateEvent();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Create New Event</span>
                  </button>
                </div>
              )}

              {/* List of Events */}
              <div className="py-1 max-h-56 overflow-y-auto space-y-1">
                {yatras.map((y) => {
                  const isCurrent = y.id === activeYatra?.id;
                  const st = getYatraStatus(y);
                  return (
                    <button
                      key={y.id}
                      type="button"
                      onClick={() => {
                        switchYatra(y.id);
                        setShowEventMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between gap-2 cursor-pointer ${
                        isCurrent
                          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-bold">{y.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                              st === "ongoing"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : st === "completed"
                                ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            }`}
                          >
                            {st === "ongoing"
                              ? "Running"
                              : st === "completed"
                              ? "Previous"
                              : "Upcoming"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {y.startPlace} ➔ {y.destination}
                        </p>
                      </div>

                      {isCurrent && (
                        <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* View All & Manage Link */}
              <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowEventMenu(false);
                    onOpenSwitchEvent();
                  }}
                  className="w-full text-center py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer flex items-center justify-center gap-1"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Browse All Events...</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Quick Actions & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
        {/* Switch Event Quick Button */}
        <button
          type="button"
          onClick={onOpenSwitchEvent}
          title="Switch Event / Trip"
          className="flex items-center gap-1.5 py-2 px-2.5 sm:px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Switch Event</span>
        </button>

        {/* Create Event Quick Button for Organizer */}
        {isOrganizer && (
          <button
            type="button"
            onClick={onOpenCreateEvent}
            className="hidden md:flex items-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 text-xs font-extrabold shadow-sm transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ New Event</span>
          </button>
        )}

        {/* Quick Add Buttons */}
        {activeYatra && (
          <>
            {canAddPayment(userRole) && (
              <button
                onClick={onAddPayment}
                className="hidden lg:flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Payment</span>
              </button>
            )}

            {canAddExpense(userRole) && (
              <button
                onClick={onAddExpense}
                className="hidden lg:flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Expense</span>
              </button>
            )}

            {canAddMember(userRole) && (
              <button
                onClick={onAddMember}
                className="hidden xl:flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Member</span>
              </button>
            )}

            {canEditYatra(userRole) && (
              <button
                onClick={onOpenSettings}
                title="Event Settings"
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </>
        )}

        {/* Install PWA Button (only visible when installable) */}
        <InstallPWAButton variant="header" />

        {/* User profile dropdown trigger */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
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

              <div className="pt-1 space-y-1">
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
