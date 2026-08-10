import React from "react";
import type { PaymentStatus } from "@/types/yatra";
import { PAYMENT_STATUS_MAP } from "@/lib/constants";

interface StatusBadgeProps {
  status: PaymentStatus;
  showHindi?: boolean;
}

export function StatusBadge({ status, showHindi = false }: StatusBadgeProps) {
  const config = PAYMENT_STATUS_MAP[status] || PAYMENT_STATUS_MAP["Pending"];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${config.badgeClass}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "Fully Paid"
            ? "bg-emerald-500 animate-pulse"
            : status === "Partial"
            ? "bg-amber-500"
            : "bg-rose-500"
        }`}
      />
      <span>{config.label}</span>
    </span>
  );
}

interface RoleBadgeProps {
  role: "organizer" | "sahayak" | "Organizer" | "Sahayak" | string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const isOrg = role.toLowerCase().includes("org") || role.toLowerCase().includes("adhyaksh");

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide ${
        isOrg
          ? "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
          : "bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
      }`}
    >
      {isOrg ? "👑 Admin" : "🤝 Sahayak / Co-organizer"}
    </span>
  );
}
