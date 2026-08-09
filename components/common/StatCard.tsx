import React from "react";

export type StatTone = "emerald" | "amber" | "rose" | "orange" | "sky" | "purple";

interface StatCardProps {
  label: string;
  hindiLabel?: string;
  value: string | number;
  hint?: string;
  tone?: StatTone;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  hint,
  tone = "emerald",
  icon,
  onClick,
}: StatCardProps) {
  const toneClasses: Record<StatTone, { bg: string; border: string; text: string; iconBg: string }> = {
    emerald: {
      bg: "bg-emerald-500/10 dark:bg-emerald-950/30",
      border: "border-emerald-200 dark:border-emerald-800/60",
      text: "text-emerald-900 dark:text-emerald-300",
      iconBg: "bg-emerald-500 text-white",
    },
    amber: {
      bg: "bg-amber-500/10 dark:bg-amber-950/30",
      border: "border-amber-200 dark:border-amber-800/60",
      text: "text-amber-900 dark:text-amber-300",
      iconBg: "bg-amber-500 text-white",
    },
    rose: {
      bg: "bg-rose-500/10 dark:bg-rose-950/30",
      border: "border-rose-200 dark:border-rose-800/60",
      text: "text-rose-900 dark:text-rose-300",
      iconBg: "bg-rose-500 text-white",
    },
    orange: {
      bg: "bg-orange-500/10 dark:bg-orange-950/30",
      border: "border-orange-200 dark:border-orange-800/60",
      text: "text-orange-900 dark:text-orange-300",
      iconBg: "bg-orange-500 text-white",
    },
    sky: {
      bg: "bg-sky-500/10 dark:bg-sky-950/30",
      border: "border-sky-200 dark:border-sky-800/60",
      text: "text-sky-900 dark:text-sky-300",
      iconBg: "bg-sky-500 text-white",
    },
    purple: {
      bg: "bg-purple-500/10 dark:bg-purple-950/30",
      border: "border-purple-200 dark:border-purple-800/60",
      text: "text-purple-900 dark:text-purple-300",
      iconBg: "bg-purple-500 text-white",
    },
  };

  const style = toneClasses[tone];

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl border transition-all duration-200 ${
        style.bg
      } ${style.border} ${
        onClick ? "cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99]" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
            {value}
          </h3>
        </div>
        {icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${style.iconBg}`}
          >
            {icon}
          </div>
        )}
      </div>
      {hint && (
        <p className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
          {hint}
        </p>
      )}
    </div>
  );
}
