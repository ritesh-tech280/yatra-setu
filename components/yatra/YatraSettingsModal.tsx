"use client";

import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { ConfirmationModal } from "../common/ConfirmationModal";
import {
  Flag,
  MapPin,
  Calendar,
  IndianRupee,
  User,
  Trash2,
  Save,
  AlertTriangle,
} from "lucide-react";
import { useYatraData } from "@/context/YatraContext";
import { useAuth } from "@/context/AuthContext";

interface YatraSettingsModalProps {
  onClose: () => void;
}

export function YatraSettingsModal({ onClose }: YatraSettingsModalProps) {
  const { activeYatra, editYatra, removeYatra } = useYatraData();
  const { isOrganizer } = useAuth();

  const [name, setName] = useState(activeYatra?.name || "");
  const [startPlace, setStartPlace] = useState(activeYatra?.startPlace || "");
  const [destination, setDestination] = useState(activeYatra?.destination || "");
  const [startDate, setStartDate] = useState(activeYatra?.startDate || "");
  const [endDate, setEndDate] = useState(activeYatra?.endDate || "");
  const [fare, setFare] = useState(String(activeYatra?.fare || 2000));
  const [description, setDescription] = useState(activeYatra?.description || "");
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !activeYatra) return;

    setLoading(true);
    try {
      await editYatra(activeYatra.id, {
        name: name.trim(),
        startPlace: startPlace.trim(),
        destination: destination.trim(),
        startDate,
        endDate,
        fare: Number(fare) || 2000,
        description: description.trim(),
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        title="Yatra Settings & Configuration"
        subtitle="Manage active yatra parameters and fare"
        onClose={onClose}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Yatra Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Starting Place
              </label>
              <input
                type="text"
                required
                value={startPlace}
                onChange={(e) => setStartPlace(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Destination
              </label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Standard Fare (₹ per Member)
            </label>
            <input
              type="number"
              min="1"
              required
              value={fare}
              onChange={(e) => setFare(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Danger Zone: Delete Yatra */}
          {isOrganizer && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    Delete this Yatra
                  </p>
                  <p className="text-[11px] text-rose-700/80 dark:text-rose-400">
                    Permanent action. All member records and expenses will be removed.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold shadow-md active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Entire Yatra"
        message={`Are you sure you want to permanently delete "${activeYatra?.name}"? All associated members, payments, and expenses will be lost.`}
        confirmLabel="Yes, Delete Yatra"
        onConfirm={async () => {
          if (activeYatra) {
            await removeYatra(activeYatra.id);
          }
          setShowDeleteConfirm(false);
          onClose();
        }}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
