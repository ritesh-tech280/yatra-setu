"use client";

import React from "react";
import { History, ArrowRight, PlusCircle, RotateCcw } from "lucide-react";
import { useYatraData } from "@/context/YatraContext";
import { getYatraStatus } from "@/lib/calculations";

interface PreviousEventBannerProps {
  onOpenSwitchEvent: () => void;
  onOpenCreateEvent: () => void;
}

export function PreviousEventBanner({
  onOpenSwitchEvent,
  onOpenCreateEvent,
}: PreviousEventBannerProps) {
  const { activeYatra, yatras, switchYatra } = useYatraData();

  if (!activeYatra) return null;

  const currentStatus = getYatraStatus(activeYatra);

  // Check if there is an ongoing/running event available
  const runningYatra = yatras.find(
    (y) => y.id !== activeYatra.id && getYatraStatus(y) === "ongoing"
  );

  // Show banner if active event is previous (completed) or if a running event exists while viewing another
  if (currentStatus !== "completed" && !runningYatra) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-start md:items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
          <History className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider">
              {currentStatus === "completed" ? "Previous / Archived Event" : "Past Trip View"}
            </span>
            <span className="text-xs font-bold text-slate-300">
              {activeYatra.name} ({activeYatra.startDate} to {activeYatra.endDate})
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            You are viewing records for this specific event. All members, payments, and bills are completely isolated.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        {runningYatra && (
          <button
            type="button"
            onClick={() => switchYatra(runningYatra.id)}
            className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Go to Active ({runningYatra.name.slice(0, 15)}...)</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenSwitchEvent}
          className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-bold border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
        >
          <span>Switch Event</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onOpenCreateEvent}
          className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>+ New Event</span>
        </button>
      </div>
    </div>
  );
}

