"use client";

import { useState, useEffect } from "react";

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Global state to store the captured event across components
let deferredPromptGlobal: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPromptGlobal = e as BeforeInstallPromptEvent;
    listeners.forEach((listener) => listener());
  });

  window.addEventListener("appinstalled", () => {
    deferredPromptGlobal = null;
    listeners.forEach((listener) => listener());
  });
}

export function usePWAInstall() {
  const [isInstallable, setIsInstallable] = useState<boolean>(!!deferredPromptGlobal);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in standalone mode
    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes("android-app://");
      setIsInstalled(!!isStandalone);
    };

    checkInstalled();
    setIsInstallable(!isInstalled && !!deferredPromptGlobal);

    const updateState = () => {
      checkInstalled();
      setIsInstallable(!!deferredPromptGlobal);
    };

    listeners.add(updateState);

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
      if (e.matches) {
        setIsInstallable(false);
      }
    };

    try {
      mediaQuery.addEventListener("change", handleDisplayModeChange);
    } catch {
      // Fallback for older browsers
      mediaQuery.addListener(handleDisplayModeChange);
    }

    return () => {
      listeners.delete(updateState);
      try {
        mediaQuery.removeEventListener("change", handleDisplayModeChange);
      } catch {
        mediaQuery.removeListener(handleDisplayModeChange);
      }
    };
  }, [isInstalled]);

  const installApp = async (): Promise<boolean> => {
    if (!deferredPromptGlobal) {
      return false;
    }

    try {
      await deferredPromptGlobal.prompt();
      const choiceResult = await deferredPromptGlobal.userChoice;
      if (choiceResult.outcome === "accepted") {
        deferredPromptGlobal = null;
        setIsInstallable(false);
        listeners.forEach((listener) => listener());
        return true;
      }
      return false;
    } catch (error) {
      console.error("[PWA] Installation failed:", error);
      return false;
    }
  };

  return {
    isInstallable: isInstallable && !isInstalled,
    isInstalled,
    installApp,
  };
}
