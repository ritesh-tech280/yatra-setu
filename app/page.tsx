"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useYatraData } from "@/context/YatraContext";
import { Sidebar, type NavTab } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { MembersView } from "@/components/members/MembersView";
import { PaymentsView } from "@/components/payments/PaymentsView";
import { ExpensesView } from "@/components/expenses/ExpensesView";
import { SahayaksView } from "@/components/sahayaks/SahayaksView";
import { ReportView } from "@/components/report/ReportView";
import { AddPaymentModal } from "@/components/payments/AddPaymentModal";
import { AddExpenseModal } from "@/components/expenses/AddExpenseModal";
import { AddMemberModal } from "@/components/members/AddMemberModal";
import { CreateYatraModal } from "@/components/yatra/CreateYatraModal";
import { SwitchEventModal } from "@/components/yatra/SwitchEventModal";
import { YatraSettingsModal } from "@/components/yatra/YatraSettingsModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { PreviousEventBanner } from "@/components/common/PreviousEventBanner";
import type { Member } from "@/types/yatra";
import { canManageSahayaks } from "@/lib/permissions";
import { Loader2, PlusCircle, Sparkles, MapPin, Calendar, IndianRupee } from "lucide-react";

export default function YatraApp() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    yatras,
    activeYatra,
    loading: dataLoading,
    isSwitchingEvent,
    hasAccess,
    userRole,
    roleLoading,
    addNewMember,
    addNewExpense,
  } = useYatraData();

  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");

  // Reset activeTab to dashboard if switching to Sahayak view while on organizer-only tab
  useEffect(() => {
    if (!canManageSahayaks(userRole) && activeTab === "sahayaks") {
      setActiveTab("dashboard");
    }
  }, [userRole, activeTab]);

  // Modal control states
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [preselectedMember, setPreselectedMember] = useState<Member | null>(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddSahayaks, setIsAddSahayaks] = useState(false);
  const [isCreateYatraOpen, setIsCreateYatraOpen] = useState(false);
  const [isSwitchEventOpen, setIsSwitchEventOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Helper for opening payment with pre-selected member
  const handleOpenPaymentForMember = (member: Member) => {
    setPreselectedMember(member);
    setIsAddPaymentOpen(true);
  };

  const handleOpenGeneralPayment = () => {
    setPreselectedMember(null);
    setIsAddPaymentOpen(true);
  };

  if (authLoading || (user && (dataLoading || roleLoading))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl shadow-xl shadow-amber-500/20 animate-pulse">
          🚩
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Connecting to YatraSetu REST Services...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (activeYatra && !hasAccess) {
    return (
      <main className="min-h-screen bg-slate-950 text-white grid place-items-center p-6">
        <section className="max-w-md text-center rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto text-2xl">
            🔒
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Trip Access</p>
            <h1 className="mt-2 text-2xl font-black">You are not a member of this Yatra</h1>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              You do not have admin or manager permissions for &ldquo;{activeYatra.name}&rdquo;.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => setIsCreateYatraOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold text-xs hover:from-amber-400 hover:to-orange-500 transition cursor-pointer"
            >
              + Create Your Own Yatra
            </button>
            <button
              onClick={() => router.push("/login")}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
            >
              Switch User Account
            </button>
          </div>
        </section>

        {isCreateYatraOpen && (
          <CreateYatraModal
            onClose={() => setIsCreateYatraOpen(false)}
          />
        )}
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Desktop Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onCreateYatraClick={() => setIsCreateYatraOpen(true)}
        onOpenSwitchEvent={() => setIsSwitchEventOpen(true)}
      />

      {/* Main Content Layout Container (Shifted right on desktop) */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <Header
          onAddPayment={handleOpenGeneralPayment}
          onAddExpense={() => setIsAddExpenseOpen(true)}
          onAddMember={() => setIsAddMemberOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenCreateEvent={() => setIsCreateYatraOpen(true)}
          onOpenSwitchEvent={() => setIsSwitchEventOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {/* If No Active Yatra exists, show prominent Create New Yatra Onboarding Hero */}
          {!activeYatra || yatras.length === 0 ? (
            <div className="min-h-[70vh] flex items-center justify-center">
              <div className="max-w-xl w-full text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto text-3xl shadow-sm">
                  🚩
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> Welcome, {user.name}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    Create Your First Trip/Event
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                    Set up your pilgrimage or group travel route, travel dates, and standard per-person fare to begin tracking members and live finances.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-left p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Route & Places</p>
                    <p className="text-[10px] text-slate-500">Source to Destination</p>
                  </div>
                  <div className="space-y-1">
                    <IndianRupee className="w-4 h-4 text-emerald-500" />
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Standard Fare</p>
                    <p className="text-[10px] text-slate-500">Fare per Member</p>
                  </div>
                  <div className="space-y-1">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Dates</p>
                    <p className="text-[10px] text-slate-500">Start & End</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreateYatraOpen(true)}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Create New Yatra</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Previous Event Notice Banner */}
              <PreviousEventBanner
                onOpenSwitchEvent={() => setIsSwitchEventOpen(true)}
                onOpenCreateEvent={() => setIsCreateYatraOpen(true)}
              />

              {/* Event Switching Loading Indicator */}
              {isSwitchingEvent ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3 animate-in fade-in duration-150">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                  <p className="text-sm font-bold">Loading event data...</p>
                </div>
              ) : (
                <>
                  {activeTab === "dashboard" && (
                    <DashboardView
                      onNavigate={(tab) => {
                        setActiveTab(tab);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      onAddPayment={handleOpenGeneralPayment}
                      onAddExpense={() => setIsAddExpenseOpen(true)}
                      onAddMember={() => setIsAddMemberOpen(true)}
                    />
                  )}

                  {activeTab === "members" && (
                    <MembersView onAddPaymentForMember={handleOpenPaymentForMember} />
                  )}

                  {activeTab === "payments" && (
                    <PaymentsView onAddPayment={handleOpenGeneralPayment} />
                  )}

                  {activeTab === "expenses" && (
                    <ExpensesView onAddExpense={() => setIsAddExpenseOpen(true)} />
                  )}

                  {activeTab === "sahayaks" && <SahayaksView />}

                  {activeTab === "report" && <ReportView />}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar */}
      {activeYatra && (
        <MobileNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onAddPayment={handleOpenGeneralPayment}
          onAddExpense={() => setIsAddExpenseOpen(true)}
          onAddMember={() => setIsAddMemberOpen(true)}
          onAddSahayak={() => setIsAddSahayaks(true)}
          onOpenCreateEvent={() => setIsCreateYatraOpen(true)}
          onOpenSwitchEvent={() => setIsSwitchEventOpen(true)}
        />
      )}

      {/* Modals */}
      {isAddPaymentOpen && (
        <AddPaymentModal
          initialMember={preselectedMember}
          onClose={() => {
            setIsAddPaymentOpen(false);
            setPreselectedMember(null);
          }}
        />
      )}

      {isAddExpenseOpen && (
        <AddExpenseModal
          onClose={() => setIsAddExpenseOpen(false)}
          onSubmit={async (data) => {
            await addNewExpense(data);
          }}
        />
      )}

      {isAddMemberOpen && (
        <AddMemberModal
          onClose={() => setIsAddMemberOpen(false)}
          onSubmit={async (data) => {
            await addNewMember(data);
          }}
        />
      )}

      {isCreateYatraOpen && (
        <CreateYatraModal onClose={() => setIsCreateYatraOpen(false)} />
      )}

      {isSwitchEventOpen && (
        <SwitchEventModal
          onClose={() => setIsSwitchEventOpen(false)}
          onCreateNewEvent={() => setIsCreateYatraOpen(true)}
        />
      )}

      {isSettingsOpen && (
        <YatraSettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}

      {isAuthOpen && (
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      )}
    </div>
  );
}
