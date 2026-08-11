"use client";

import React, { useState } from "react";
import { Download, Smartphone, Check, Loader2 } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

interface InstallPWAButtonProps {
  variant?: "header" | "sidebar" | "banner" | "button" | "compact";
  className?: string;
  onSuccess?: () => void;
}

export function InstallPWAButton({
  variant = "button",
  className = "",
  onSuccess,
}: InstallPWAButtonProps) {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  // If already installed or installation is not supported/prompted, do not render
  if (!isInstallable || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    setInstalling(true);
    try {
      const accepted = await installApp();
      if (accepted) {
        setInstalledSuccess(true);
        onSuccess?.();
      }
    } finally {
      setInstalling(false);
    }
  };

  if (variant === "header") {
    return (
      <button
        onClick={handleInstall}
        disabled={installing}
        title="Install Trip Manager App"
        className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 animate-pulse hover:animate-none ${className}`}
      >
        {installing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : installedSuccess ? (
          <Check className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  if (variant === "sidebar") {
    return (
      <div className={`p-3 mx-3 mb-2 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-500/20 text-slate-200 ${className}`}>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white leading-tight">Install App</div>
            <div className="text-[10px] text-slate-400">Add to your Home Screen</div>
          </div>
        </div>
        <button
          onClick={handleInstall}
          disabled={installing}
          className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {installing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>Install Now</span>
        </button>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className={`flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-base shadow-xs">
            🚩
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Install Trip Manager</h4>
            <p className="text-[11px] text-slate-400">Fast standalone access & quick ledger entry</p>
          </div>
        </div>
        <button
          onClick={handleInstall}
          disabled={installing}
          className="py-1.5 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {installing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>Install</span>
        </button>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <button
        onClick={handleInstall}
        disabled={installing}
        title="Install App"
        className={`w-9 h-9 rounded-xl border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 flex items-center justify-center transition cursor-pointer ${className}`}
      >
        {installing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleInstall}
      disabled={installing}
      className={`inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50 ${className}`}
    >
      {installing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      <span>Install App</span>
    </button>
  );
}
