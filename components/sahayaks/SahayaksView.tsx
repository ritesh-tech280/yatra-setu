"use client";

import React, { useState } from "react";
import {
  UserPlus,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Check,
  Lock,
  Copy,
  CheckCheck,
  Share2,
  Clock,
  Send,
  AlertCircle,
} from "lucide-react";
import { useYatraData } from "@/context/YatraContext";
import { Modal } from "../common/Modal";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { RoleBadge } from "../common/Badge";
import { formatDate } from "@/lib/utils";
import { canManageSahayaks } from "@/lib/permissions";
import { useToast } from "@/context/ToastContext";

export function SahayaksView() {
  const {
    sahayaks,
    members,
    activeYatra,
    userRole,
    removeSahayak,
    invitations,
    sendSahayakInvitation,
    cancelSahayakInvite,
  } = useYatraData();
  const { success, error, info } = useToast();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sahayakToDelete, setSahayakToDelete] = useState<string | null>(null);
  const [inviteToCancel, setInviteToCancel] = useState<{ id: string; token: string } | null>(null);

  // Success Invite Link Modal
  const [inviteResult, setInviteResult] = useState<{
    inviteUrl: string;
    email: string;
    name?: string;
    emailSent?: boolean;
    emailError?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

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
    if (!name.trim() || !phone.trim() || !email.trim() || !activeYatra) return;

    setLoading(true);
    try {
      const result = await sendSahayakInvitation({
        email: email.trim().toLowerCase(),
        name: name.trim(),
        phone: phone.trim(),
        memberId: selectedMemberId || undefined,
      });

      if (result) {
        setShowAddModal(false);
        setSelectedMemberId("");
        setName("");
        setPhone("");
        setEmail("");

        setInviteResult({
          inviteUrl: result.inviteUrl,
          email: result.invitation.email,
          name: result.invitation.name,
          emailSent: (result as any).emailSent ?? false,
          emailError: (result as any).emailError,
        });
      }
    } catch (inviteError) {
      error(inviteError instanceof Error ? inviteError.message : "Could not send invitation.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      success("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      info("Please copy link manually: " + url);
    }
  };

  const handleShareWhatsApp = (url: string, recipientName?: string) => {
    const text = encodeURIComponent(
      ` ${recipientName ? recipientName + ", you" : "You"} have been invited to join "${activeYatra?.name || "Kanwar Yatra"}" as a Manager. Accept invitation and access live dashboard here: ${url}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const pendingInvitations = invitations.filter((inv) => inv.status === "pending");

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              Managers
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              {sahayaks.length} Active
            </span>
            {pendingInvitations.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                {pendingInvitations.length} Pending Invite{pendingInvitations.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Empower trusted group members to collect payments and log expenses alongside the Admin.
          </p>
        </div>

        {isOrganizer && (
          <button
            onClick={() => setShowAddModal(true)}
            className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs md:text-sm shadow-md shadow-orange-600/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Assign New Manager</span>
          </button>
        )}
      </div>

      {/* Permissions Breakdown Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* What Sahayaks CAN do */}
        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-extrabold text-xs uppercase tracking-wider">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Manager Permissions</span>
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
              <span>Add & manage Trip expenses with their name as payer</span>
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
              <span>Cannot delete the primary Travel group</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Cannot remove or modify the Admin</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Cannot add or remove other Managers</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Cannot alter the standard per-person Trip fare</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Pending Invitations Section */}
      {pendingInvitations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Manager Invitations ({pendingInvitations.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {pendingInvitations.map((inv) => {
              const inviteLink =
                typeof window !== "undefined"
                  ? `${window.location.origin}/invite/${inv.token}`
                  : `/invite/${inv.token}`;

              return (
                <div
                  key={inv.id}
                  className="bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                      <Send className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                          {inv.name || inv.email}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                          Pending
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{inv.email}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Expires: {formatDate(inv.expiresAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopyLink(inviteLink)}
                      title="Copy Invite Link"
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-amber-100 hover:text-amber-700 transition cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShareWhatsApp(inviteLink, inv.name)}
                      title="Share via WhatsApp"
                      className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    {isOrganizer && (
                      <button
                        onClick={() => setInviteToCancel({ id: inv.id, token: inv.token })}
                        title="Cancel Invitation"
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sahayaks List */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1">
          Active Manager for {activeYatra?.name}
        </h3>

        {sahayaks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
              🤝
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              No Manager assigned yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              As the Admin, you can assign Manager via email invitation to help manage member collections and expenses.
            </p>
            {isOrganizer && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-2 py-2 px-4 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-600 transition cursor-pointer"
              >
                + Assign Manager
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
                        {s.name || "Assigned Manager"}
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
                    title="Remove Manager"
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
          title="Send Manager Invitation"
          subtitle="Invite a Manager via email or shareable link"
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
                Manager Full Name <span className="text-rose-500">*</span>
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
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul.manager@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                An invitation link will be created. The recipient can accept it to instantly become a Manager for this Trip.
              </p>
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
                disabled={loading || !name.trim() || !phone.trim() || !email.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-bold shadow-md shadow-orange-950/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? "Creating..." : "Send Manager Invitation"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Invitation Created & Share Modal */}
      {inviteResult && (
        <Modal
          title="Invitation Ready!"
          subtitle={`Manager invite link generated for ${inviteResult.email}`}
          onClose={() => setInviteResult(null)}
          maxWidth="md"
        >
          <div className="space-y-4">
            {inviteResult.emailSent ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Email Delivered</p>
                  <p className="mt-0.5">An invitation email was sent directly to <strong>{inviteResult.email}</strong>.</p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Share Direct Link</p>
                  <p className="mt-0.5">
                    {inviteResult.emailError
                      ? `Email note: ${inviteResult.emailError}. You can share the link below directly.`
                      : "Please copy or share the direct invite link with the Manager."}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Direct Invite Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteResult.inviteUrl}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => handleCopyLink(inviteResult.inviteUrl)}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleShareWhatsApp(inviteResult.inviteUrl, inviteResult.name)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Share2 className="w-4 h-4" />
                <span>Share on WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setInviteResult(null)}
                className="py-2.5 px-5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Remove Sahayak Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(sahayakToDelete)}
        title="Remove Manager"
        message="Are you sure you want to remove this Manager from the Trip? They will no longer be able to record payments or expenses."
        confirmLabel="Remove"
        onConfirm={() => {
          if (sahayakToDelete) {
            removeSahayak(sahayakToDelete);
            setSahayakToDelete(null);
          }
        }}
        onClose={() => setSahayakToDelete(null)}
      />

      {/* Cancel Invite Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(inviteToCancel)}
        title="Cancel Manager Invitation"
        message="Are you sure you want to cancel this pending invitation? The recipient will not be able to use this link to join."
        confirmLabel="Cancel Invite"
        onConfirm={() => {
          if (inviteToCancel) {
            cancelSahayakInvite(inviteToCancel.id, inviteToCancel.token);
            setInviteToCancel(null);
          }
        }}
        onClose={() => setInviteToCancel(null)}
      />
    </div>
  );
}
