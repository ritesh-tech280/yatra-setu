"use client";

import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { User, Phone, MapPin, FileText, UserPlus, Save, Trash2 } from "lucide-react";
import { useYatraData } from "@/context/YatraContext";
import type { Member } from "@/types/yatra";

interface AddMemberModalProps {
  member?: Member | null;
  onClose: () => void;
  onSubmit: (data: { name: string; phone: string; address?: string; notes?: string }) => Promise<void>;
  onDelete?: (memberId: string) => Promise<void> | void;
}

export function AddMemberModal({ member, onClose, onSubmit, onDelete }: AddMemberModalProps) {
  const { isOrganizer } = useYatraData();
  const isEditing = Boolean(member);
  const [name, setName] = useState(member?.name || "");
  const [phone, setPhone] = useState(member?.phone || "");
  const [address, setAddress] = useState(member?.address || "");
  const [notes, setNotes] = useState(member?.notes || "");
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim(),
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        title={isEditing ? "Edit Member Details" : "Add New Member"}
        subtitle={isEditing ? "Update member contact and notes" : "Register a member in this Yatra group"}
        onClose={onClose}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Name"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Used for WhatsApp payment receipt & status updates.</p>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Address / City / Village <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Notes / Seat No / Remarks <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Seat 12, Senior citizen"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3">
            {isEditing && onDelete && isOrganizer ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-bold shadow-md shadow-orange-600/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isEditing ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{loading ? "Saving..." : isEditing ? "Save Changes" : "Add Member"}</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Member Confirmation Modal */}
      {isEditing && member && (
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          title="Confirm Delete Member"
          message={`Are you sure you want to permanently delete "${member.name}"? All associated payment records and ledger history for this member will also be removed. This action cannot be undone.`}
          confirmLabel="Yes, Delete Member"
          cancelLabel="Cancel"
          isDestructive={true}
          onConfirm={async () => {
            if (onDelete) {
              await onDelete(member.id);
              setShowDeleteConfirm(false);
              onClose();
            }
          }}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}
