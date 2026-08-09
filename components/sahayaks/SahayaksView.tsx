"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Check,
  X,
  Lock,
  Sparkles,
  User,
} from "lucide-react";
import { useYatraData } from "@/context/YatraContext";
import { Modal } from "../common/Modal";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { RoleBadge } from "../common/Badge";
import { formatDate } from "@/lib/utils";
import { canManageSahayaks } from "@/lib/permissions";

export function SahayaksView() {
  const { sahayaks, members, activeYatra, userRole, addNewSahayak, removeSahayak } = useYatraData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [uid, setUid] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sahayakToDelete, setSahayakToDelete] = useState<string | null>(null);

  const isOrganizer = canManageSahayaks(userRole);

  const handleMemberSelect = (mId: string) => {
    setSelectedMemberId(mId);
    if (mId) {
      const selected = members.find((m) => m.id === mId);
      if (selected) {
        setName(selected.name);
        setPhone(selected.phone);
      }
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setLoading(true);
    try {
      const res = await addNewSahayak({
        uid: uid.trim() || undefined,
        memberId: selectedMemberId || undefined,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });
      if (res) {
        setShowAddModal(false);
        setSelectedMemberId("");
        setUid("");
        setName("");
        setPhone("");
        setEmail("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              Co-Organizers (Sahayaks)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              {sahayaks.length} Assigned
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Empower trusted group members to collect payments and log expenses alongside the Organizer.
          </p>
        </div>

        {isOrganizer && (
          <button
            onClick={() => setShowAddModal(true)}
            className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs md:text-sm shadow-md shadow-orange-600/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Assign New Sahayak</span>
          </button>
        )}
      </div>

      {/* Permissions Breakdown Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* What Sahayaks CAN do */}
        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-extrabold text-xs uppercase tracking-wider">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Sahayak Permissions</span>
          </div>
          <ul className="space-y-2 text-xs text-emerald-950 dark:text-emerald-200">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Add & edit member contact info</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Record member fare payments with instant receipts</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Add & manage Yatra expenses with their name as payer</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>View live dashboard & download final printable reports</span>
            </li>
          </ul>
        </div>

        {/* What Sahayaks CANNOT do (Guardrails) */}
        <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-rose-900 dark:text-rose-300 font-extrabold text-xs uppercase tracking-wider">
            <Lock className="w-4 h-4 text-rose-600" />
            <span>Security Guardrails</span>
          </div>
          <ul className="space-y-2 text-xs text-rose-950 dark:text-rose-200">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Cannot delete the primary Yatra group</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Cannot remove or modify the Organizer</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Cannot add or remove other Sahayaks</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Cannot alter the standard per-person Yatra fare</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Sahayaks List */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1">
          Active Sahayaks for {activeYatra?.name}
        </h3>

        {sahayaks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
              🤝
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              No Sahayaks assigned yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              As the Organizer, you can assign co-organizers to help manage member collections and expenses.
            </p>
            {isOrganizer && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-2 py-2 px-4 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-600 transition cursor-pointer"
              >
                + Assign Sahayak
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {sahayaks.map((s) => (
              <div
                key={s.id || s.uid}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                    {(s.name || s.uid || "SH").substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {s.name || "Assigned Sahayak"}
                      </h3>
                      <RoleBadge role="sahayak" />
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      {s.phone && (
                        <a
                          href={`tel:${s.phone.replace(/\s+/g, "")}`}
                          className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold hover:text-amber-600"
                        >
                          <Phone className="w-3 h-3 text-amber-500" />
                          <span>{s.phone}</span>
                        </a>
                      )}
                      {s.email && (
                        <span className="hidden sm:inline-flex items-center gap-1 truncate max-w-[150px]">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{s.email}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>UID: {s.uid || s.id} • Active</span>
                    </p>
                  </div>
                </div>

                {isOrganizer && (
                  <button
                    onClick={() => setSahayakToDelete(s.id || s.uid)}
                    title="Remove Sahayak"
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Sahayak Modal */}
      {showAddModal && (
        <Modal
          title="Assign New Sahayak"
          subtitle="Grant co-organizer access for this Yatra"
          onClose={() => setShowAddModal(false)}
          maxWidth="md"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            {members.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Link to Existing Member <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => handleMemberSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Select Member to autofill --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.phone})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Sahayak Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 98765 24011"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Firebase User UID <span className="text-slate-400 font-normal">(Optional, generated if left blank)</span>
              </label>
              <input
                type="text"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                placeholder="e.g. user_456 or leave blank for auto-id"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul.sahayak@yatrasetu.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim() || !phone.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-bold shadow-md shadow-orange-950/20 active:scale-95 transition cursor-pointer"
              >
                {loading ? "Assigning..." : "Assign Sahayak"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Remove Sahayak Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(sahayakToDelete)}
        title="Remove Sahayak"
        message="Are you sure you want to remove this Sahayak from the Yatra? They will no longer be able to record payments or expenses."
        confirmLabel="Remove"
        onConfirm={() => {
          if (sahayakToDelete) {
            removeSahayak(sahayakToDelete);
            setSahayakToDelete(null);
          }
        }}
        onClose={() => setSahayakToDelete(null)}
      />
    </div>
  );
}
