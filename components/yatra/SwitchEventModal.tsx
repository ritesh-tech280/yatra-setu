"use client";

import React, { useState, useMemo } from "react";
import { Modal } from "../common/Modal";
import {
  Calendar,
  MapPin,
  IndianRupee,
  Search,
  PlusCircle,
  CheckCircle2,
  ArrowRight,
  Check,
} from "lucide-react";
import { useYatraData } from "@/context/YatraContext";
import { inr, getYatraStatus, type YatraEventStatus } from "@/lib/calculations";

interface SwitchEventModalProps {
  onClose: () => void;
  onCreateNewEvent: () => void;
}

export function SwitchEventModal({ onClose, onCreateNewEvent }: SwitchEventModalProps) {
  const { yatras, activeYatra, switchYatra } = useYatraData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | YatraEventStatus>("all");

  const filteredYatras = useMemo(() => {
    return yatras.filter((y) => {
      const matchesSearch =
        y.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        y.startPlace.toLowerCase().includes(searchTerm.toLowerCase()) ||
        y.destination.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (filterStatus === "all") return true;
      const status = getYatraStatus(y);
      return status === filterStatus;
    });
  }, [yatras, searchTerm, filterStatus]);

  const handleSelectYatra = (yatraId: string) => {
    switchYatra(yatraId);
    onClose();
  };

  return (
    <Modal
      title="Switch Event / Trip"
      subtitle="Select an event to view its isolated records, members, and live treasury"
      onClose={onClose}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Search and Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by event name, origin, or destination..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onCreateNewEvent();
            }}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-95 transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create New Event</span>
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
              filterStatus === "all"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            All Events ({yatras.length})
          </button>
          <button
            onClick={() => setFilterStatus("ongoing")}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
              filterStatus === "ongoing"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100"
            }`}
          >
            🟢 Running / Ongoing
          </button>
          <button
            onClick={() => setFilterStatus("completed")}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
              filterStatus === "completed"
                ? "bg-slate-700 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            📂 Previous / Completed
          </button>
          <button
            onClick={() => setFilterStatus("upcoming")}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
              filterStatus === "upcoming"
                ? "bg-blue-600 text-white"
                : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100"
            }`}
          >
            🗓️ Upcoming
          </button>
        </div>

        {/* Events List */}
        <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
          {filteredYatras.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                No events found matching your criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCreateNewEvent();
                }}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Create a new event now</span>
              </button>
            </div>
          ) : (
            filteredYatras.map((yatra) => {
              const isActive = yatra.id === activeYatra?.id;
              const status = getYatraStatus(yatra);

              return (
                <div
                  key={yatra.id}
                  onClick={() => handleSelectYatra(yatra.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isActive
                      ? "bg-amber-50/70 dark:bg-amber-950/20 border-amber-400 dark:border-amber-700 shadow-sm"
                      : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/80 dark:hover:bg-slate-800"
                  }`}
                >
                  {/* Event Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white truncate">
                        {yatra.name}
                      </h4>

                      {/* Status Badge */}
                      {status === "ongoing" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Running
                        </span>
                      )}
                      {status === "completed" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                          Previous
                        </span>
                      )}
                      {status === "upcoming" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                          Upcoming
                        </span>
                      )}

                      {/* Active Tag */}
                      {isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                          <Check className="w-3 h-3 stroke-[3]" /> Active
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>
                          {yatra.startPlace} ➔ {yatra.destination}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {yatra.startDate} to {yatra.endDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{inr(yatra.fare)} / member</span>
                      </div>
                    </div>
                  </div>

                  {/* Switch Action Button */}
                  <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                    {isActive ? (
                      <span className="py-1.5 px-3 rounded-xl bg-amber-200 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Currently Active</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectYatra(yatra.id);
                        }}
                        className="py-1.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <span>Switch</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>
            🔒 Data Isolation: Each event maintains its own independent members, payments, and bills.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-slate-700 dark:text-slate-300 hover:underline cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
