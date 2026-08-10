"use client";

import  { useState, useMemo } from "react";
import {
  Search,
  UserPlus,
  Phone,
  IndianRupee,
  Share2,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useYatraData } from "@/context/YatraContext";
import { StatusBadge } from "../common/Badge";
import { MemberDetailModal } from "./MemberDetailModal";
import { AddMemberModal } from "./AddMemberModal";
import { inr, getMemberBalance } from "@/lib/calculations";
import { getWhatsAppReceiptUrl } from "@/lib/utils";
import type { Member, PaymentStatus } from "@/types/yatra";

interface MembersViewProps {
  onAddPaymentForMember: (member: Member) => void;
}

export function MembersView({ onAddPaymentForMember }: MembersViewProps) {
  const {
    activeYatra,
    members,
    payments,
    addNewMember,
    editMember,
    removeMember,
    removePayment,
  } = useYatraData();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | PaymentStatus>("All");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fare = activeYatra?.fare || 0;

  // Filter and sort members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const balance = getMemberBalance(m.id, payments, fare);

      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        m.name.toLowerCase().includes(query) ||
        m.phone.toLowerCase().includes(query) ||
        (m.address && m.address.toLowerCase().includes(query)) ||
        (m.notes && m.notes.toLowerCase().includes(query));

      // Status match
      const matchesStatus = statusFilter === "All" || balance.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [members, payments, fare, searchQuery, statusFilter]);

  // Counts for tabs
  const counts = useMemo(() => {
    let full = 0;
    let partial = 0;
    let pending = 0;
    for (const m of members) {
      const b = getMemberBalance(m.id, payments, fare);
      if (b.status === "Fully Paid") full++;
      else if (b.status === "Partial") partial++;
      else pending++;
    }
    return { all: members.length, full, partial, pending };
  }, [members, payments, fare]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Add Member Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              Members Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              {members.length} Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage member list, track remaining dues, and send WhatsApp payment receipts.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs md:text-sm shadow-md shadow-orange-600/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Search Bar & Filter Chips */}
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by member name, phone number, or address..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white shadow-xs focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-3 text-xs font-bold text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded-md hover:bg-slate-100 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter("All")}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              statusFilter === "All"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
            }`}
          >
            <span>All Members</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px]">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("Fully Paid")}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              statusFilter === "Fully Paid"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50/50"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Fully Paid</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px]">
              {counts.full}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("Partial")}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              statusFilter === "Partial"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-50/50"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Partially Paid</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px]">
              {counts.partial}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("Pending")}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              statusFilter === "Pending"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50/50"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Payment Pending</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px]">
              {counts.pending}
            </span>
          </button>
        </div>
      </div>

      {/* Members Cards List */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
            🔍
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white text-base">
            No members found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No members matching "${searchQuery}". Try a different name or phone number.`
              : "No members in this category. Click '+ Add New Member' to register."}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-2 py-2 px-4 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-600 transition cursor-pointer"
          >
            + Add New Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredMembers.map((m) => {
            const balance = getMemberBalance(m.id, payments, fare);
            const memberPayments = payments.filter((p) => p.memberId === m.id);
            const latestPayment = memberPayments[memberPayments.length - 1];
            const whatsappUrl = activeYatra
              ? getWhatsAppReceiptUrl(m, activeYatra, balance.paid, balance.remaining, latestPayment)
              : "#";

            return (
              <div
                key={m.id}
                onClick={() => setSelectedMember(m)}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Top row: Initial, Name, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                        {m.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                          {m.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                            <Phone className="w-3 h-3 text-amber-500" />
                            {m.phone}
                          </span>
                          {m.address && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] truncate max-w-[130px]">
                              • {m.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <StatusBadge status={balance.status} />
                  </div>

                  {/* Financial Bar */}
                  <div className="mt-4 grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Fare</span>
                      <p className="text-xs font-black text-slate-700 dark:text-slate-200 mt-0.5">
                        {inr(fare)}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-600">Paid</span>
                      <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {inr(balance.paid)}
                      </p>
                    </div>

                    <div>
                      <span className={`text-[10px] uppercase font-bold ${balance.remaining > 0 ? "text-rose-600" : "text-slate-400"}`}>
                        Due
                      </span>
                      <p className={`text-xs font-black mt-0.5 ${balance.remaining > 0 ? "text-rose-700 dark:text-rose-400" : "text-slate-400"}`}>
                        {inr(balance.remaining)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="Send WhatsApp Receipt / Reminder"
                      className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="text-[11px] hidden sm:inline">WhatsApp</span>
                    </a>

                    <a
                      href={`tel:${m.phone.replace(/\s+/g, "")}`}
                      onClick={(e) => e.stopPropagation()}
                      title="Call Member"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-500" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    {balance.remaining > 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddPaymentForMember(m);
                        }}
                        className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1 active:scale-95 transition cursor-pointer"
                      >
                        <IndianRupee className="w-3 h-3" />
                        <span>Collect</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </span>
                    )}

                    <span className="text-slate-400 group-hover:text-amber-500 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Member Dossier Modal */}
      {selectedMember && activeYatra && (
        <MemberDetailModal
          member={selectedMember}
          yatra={activeYatra}
          payments={payments}
          onClose={() => setSelectedMember(null)}
          onAddPaymentForMember={(m) => onAddPaymentForMember(m)}
          onEditMember={(m) => setMemberToEdit(m)}
          onDeleteMember={(id) => removeMember(id)}
          onDeletePayment={(pId) => removePayment(pId)}
        />
      )}

      {/* Add / Edit Member Modal */}
      {(showAddModal || memberToEdit) && (
        <AddMemberModal
          member={memberToEdit}
          onClose={() => {
            setShowAddModal(false);
            setMemberToEdit(null);
          }}
          onSubmit={async (data) => {
            if (memberToEdit) {
              await editMember(memberToEdit.id, data);
            } else {
              await addNewMember(data);
            }
          }}
        />
      )}
    </div>
  );
}
