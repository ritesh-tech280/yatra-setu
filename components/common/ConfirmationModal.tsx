"use client";

import React from "react";
import { Modal } from "./Modal";
import { AlertTriangle, Trash2 } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = true,
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <Modal title={title} onClose={onClose} maxWidth="sm">
      <div className="flex flex-col items-center text-center py-2">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            isDestructive
              ? "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
              : "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
          }`}
        >
          {isDestructive ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white shadow-sm transition ${
              isDestructive
                ? "bg-rose-600 hover:bg-rose-700 active:bg-rose-800"
                : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
