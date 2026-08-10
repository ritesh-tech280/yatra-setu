"use client";

import React from "react";
import {
  LayoutDashboard,
  Users,
  IndianRupee,
  Receipt,
  FileSpreadsheet,
  ShieldCheck,
  PlusCircle,
  LogOut,
  Sparkles,
  MapPin,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useYatraData } from "@/context/YatraContext";
import { RoleBadge } from "../common/Badge";
import { inr } from "@/lib/calculations";
import { canManageSahayaks } from "@/lib/permissions";

export type NavTab = "dashboard" | "members" | "payments" | "expenses" | "sahayaks" | "report";

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onCreateYatraClick: () => void;
}

export function Sidebar({ activeTab, onSelectTab, onCreateYatraClick }: SidebarProps) {
  const { user, logout } = useAuth();
  const { activeYatra, yatras, switchYatra, userRole, isOrganizer } = useYatraData();

  const allNavItems: { id: NavTab; label: string; icon: React.ReactNode; organizerOnly?: boolean }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "members", label: "Members Directory", icon: <Users className="w-5 h-5" /> },
    { id: "payments", label: "Payments Ledger", icon: <IndianRupee className="w-5 h-5" /> },
    { id: "expenses", label: "Expenses & Bills", icon: <Receipt className="w-5 h-5" /> },
    { id: "sahayaks", label: "Manager", icon: <ShieldCheck className="w-5 h-5" />, organizerOnly: true },
    { id: "report", label: "Final Report", icon: <FileSpreadsheet className="w-5 h-5" /> },
  ];

  const visibleNavItems = allNavItems.filter(
    (item) => !item.organizerOnly || canManageSahayaks(userRole)
  );

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-slate-900 text-slate-100 h-screen fixed top-0 left-0 border-r border-slate-800 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/20">
            🚩
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
              YatraSetu
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                PRO
              </span>
            </h1>
            <p className="text-xs text-slate-400">Digital Travel & Group Ledger</p>
          </div>
        </div>
      </div>

      {/* Active Yatra Selector / Switcher */}
      <div className="p-4">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 relative group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Active Trip
            </span>
            <span className="text-slate-400 font-normal">
              Fare: <strong className="text-white">{inr(activeYatra?.fare || 0)}</strong>
            </span>
          </div>

          {yatras.length > 0 ? (
            <select
              value={activeYatra?.id || ""}
              onChange={(e) => switchYatra(e.target.value)}
              className="w-full bg-slate-900/90 text-white font-bold text-sm rounded-xl py-2 px-3 border border-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {Array.from(new Map(yatras.map((y) => [y.id, y])).values()).map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-xs text-slate-400 py-1 font-medium">
              No Yatra Created Yet
            </div>
          )}

          {activeYatra && (
            <div className="mt-2.5 flex flex-col gap-1 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">
                  {activeYatra.startPlace} ➔ {activeYatra.destination}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>
                  {activeYatra.startDate} — {activeYatra.endDate}
                </span>
              </div>
            </div>
          )}

          {isOrganizer && (
            <button
              onClick={onCreateYatraClick}
              className="mt-3 w-full py-1.5 px-3 rounded-lg bg-slate-700/50 hover:bg-amber-500/20 text-xs font-semibold text-amber-300 hover:text-amber-200 border border-slate-600/50 hover:border-amber-500/40 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" /> + Create New Trip
            </button>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-1 pt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>
        {visibleNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer group ${
                isActive
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-600/20"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <span
                className={`${
                  isActive ? "text-white" : "text-slate-400 group-hover:text-amber-400"
                }`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-xs shrink-0">
            {user?.name?.substring(0, 2).toUpperCase() || "US"}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-xs text-white truncate">{user?.name || "User"}</p>
            <div className="mt-0.5">
              <RoleBadge role={userRole === "sahayak" ? "sahayak" : "organizer"} />
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          title="Logout"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition shrink-0 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
