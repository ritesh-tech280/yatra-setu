"use client";

import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { StatusBadge } from "../common/Badge";
import { ConfirmationModal } from "../common/ConfirmationModal";
import {
  Phone,
  MapPin,
  FileText,
  IndianRupee,
  Calendar,
  Share2,
  Trash2,
  Edit2,
  PlusCircle,
  Clock,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import type { Member, Payment, Yatra } from "@/types/yatra";
import { getMemberBalance, inr } from "@/lib/calculations";
import { formatDate, getWhatsAppReceiptUrl } from "@/lib/utils";
import { useYatraData } from "@/context/YatraContext";

interface MemberDetailModalProps {
  member: Member;
  yatra: Yatra;
  payments: Payment[];
  onClose: () => void;
  onAddPaymentForMember: (member: Member) => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (memberId: string) => void;
  onDeletePayment: (paymentId: string) => void;
}

export function MemberDetailModal({
  member,
  yatra,
  payments,
  onClose,
  onAddPaymentForMember,
  onEditMember,
  onDeleteMember,
  onDeletePayment,
}: MemberDetailModalProps) {
  const { isOrganizer } = useYatraData();
  const balance = getMemberBalance(member.id, payments, yatra.fare);
  const memberPayments = payments
    .filter((p) => p.memberId === member.id)
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  const [showDeleteMemberConfirm, setShowDeleteMemberConfirm] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

  const whatsappUrl = getWhatsAppReceiptUrl(
    member,
    yatra,
    balance.paid,
    balance.remaining,
    memberPayments[0]
  );

  return (
    <>
      <Modal
        title="Member Dossier"
        subtitle="Complete payment record & member details"
        onClose={onClose}
        maxWidth="lg"
      >
        <div className="space-y-6">
          {/* Top Profile Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-md">
                {member.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  {member.name}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <a
                    href={`tel:${member.phone.replace(/\s+/g, "")}`}
                    className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold hover:text-amber-600"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                    <span>{member.phone}</span>
                  </a>
                  {member.address && (
                    <span className="flex items-center gap-1 truncate max-w-[160px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{member.address}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <StatusBadge status={balance.status} />
            </div>
          </div>

          {/* 3-Column Financial Status Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Standard Fare */}
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-center border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Standard Fare
              </p>
              <p className="text-lg md:text-xl font-black text-slate-800 dark:text-white mt-1">
                {inr(yatra.fare)}
              </p>
            </div>

            {/* Total Paid */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-center border border-emerald-200 dark:border-emerald-800">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Total Paid
              </p>
              <p className="text-lg md:text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                {inr(balance.paid)}
              </p>
            </div>

            {/* Remaining Due */}
            <div className={`p-3.5 rounded-2xl text-center border ${
              balance.remaining > 0
                ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800"
                : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700"
            }`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${
                balance.remaining > 0 ? "text-rose-700 dark:text-rose-400" : "text-slate-500"
              }`}>
                Remaining Due
              </p>
              <p className={`text-lg md:text-xl font-black mt-1 ${
                balance.remaining > 0 ? "text-rose-700 dark:text-rose-300" : "text-slate-400"
              }`}>
                {inr(balance.remaining)}
              </p>
            </div>
          </div>

          {/* Notes section if any */}
          {member.notes && (
            <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 rounded-xl flex items-start gap-2.5 text-xs text-amber-950 dark:text-amber-200">
              <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Remark:</strong> {member.notes}
              </div>
            </div>
          )}

          {/* WhatsApp Share & Call CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Receipt on WhatsApp</span>
            </a>

            <a
              href={`tel:${member.phone.replace(/\s+/g, "")}`}
              className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-amber-500" />
              <span>Call Member ({member.phone})</span>
            </a>
          </div>

          {/* Payment History Timeline */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Payment History ({memberPayments.length} transactions)</span>
              </h4>

              {balance.remaining > 0 && (
                <button
                  onClick={() => {
                    onClose();
                    onAddPaymentForMember(member);
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Record Payment</span>
                </button>
              )}
            </div>

            {memberPayments.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-400">
                No payment recorded yet for this member.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                {memberPayments.map((p, idx) => (
                  <div key={p.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {memberPayments.length - idx}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {inr(p.amount)}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {p.paymentMethod}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formatDate(p.paymentDate)}
                          {p.note && ` • "${p.note}"`}
                          {p.createdByName && ` • Received by: ${p.createdByName}`}
                        </p>
                      </div>
                    </div>

                    {isOrganizer && (
                      <button
                        onClick={() => setPaymentToDelete(p.id)}
                        title="Delete payment"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onEditMember(member);
                }}
                className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Info</span>
              </button>

              {isOrganizer && (
                <button
                  onClick={() => setShowDeleteMemberConfirm(true)}
                  className="py-2 px-3 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>

            {balance.remaining > 0 ? (
              <button
                onClick={() => {
                  onClose();
                  onAddPaymentForMember(member);
                }}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-extrabold shadow-sm active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
              >
                <IndianRupee className="w-4 h-4" />
                <span>+ Collect {inr(balance.remaining)}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero Due</span>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Member Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteMemberConfirm}
        title="Confirm Delete Member"
        message={`Are you sure you want to permanently delete "${member.name}"? All associated payment records and ledger history for this member will also be removed. This action cannot be undone.`}
        confirmLabel="Yes, Delete Member"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={() => {
          onDeleteMember(member.id);
          onClose();
        }}
        onClose={() => setShowDeleteMemberConfirm(false)}
      />

      {/* Delete Payment Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(paymentToDelete)}
        title="Delete Payment Record"
        message="Are you sure you want to delete this payment record? The member's remaining balance will increase accordingly."
        confirmLabel="Delete Payment"
        onConfirm={() => {
          if (paymentToDelete) {
            onDeletePayment(paymentToDelete);
            setPaymentToDelete(null);
          }
        }}
        onClose={() => setPaymentToDelete(null)}
      />
    </>
  );
}
