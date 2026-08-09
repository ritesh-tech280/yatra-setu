"use client";

import React, { createContext, useContext, useState, useCallback, useId } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    addToast(message, type);
  }, [addToast]);

  const success = useCallback((message: string) => addToast(message, "success"), [addToast]);
  const error = useCallback((message: string) => addToast(message, "error"), [addToast]);
  const warning = useCallback((message: string) => addToast(message, "warning"), [addToast]);
  const info = useCallback((message: string) => addToast(message, "info"), [addToast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all transform animate-in slide-in-from-bottom-3 duration-200 border ${
              t.type === "success"
                ? "bg-emerald-900 text-emerald-100 border-emerald-700 shadow-emerald-950/20"
                : t.type === "error"
                ? "bg-rose-900 text-rose-100 border-rose-700 shadow-rose-950/20"
                : t.type === "warning"
                ? "bg-amber-900 text-amber-100 border-amber-700 shadow-amber-950/20"
                : "bg-slate-900 text-slate-100 border-slate-700 shadow-slate-950/20"
            }`}
          >
            <span className="text-base">
              {t.type === "success" && "✓"}
              {t.type === "error" && "✕"}
              {t.type === "warning" && "⚠️"}
              {t.type === "info" && "ℹ️"}
            </span>
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
