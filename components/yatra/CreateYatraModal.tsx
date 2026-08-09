"use client";

import React, { useState } from "react";
import { Modal } from "../common/Modal";
import {
  Flag,
  MapPin,
  Calendar,
  IndianRupee,
  User,
  FileText,
  PlusCircle,
} from "lucide-react";
import { useYatraData } from "@/context/YatraContext";
import { useAuth } from "@/context/AuthContext";

interface CreateYatraModalProps {
  onClose: () => void;
}

export function CreateYatraModal({ onClose }: CreateYatraModalProps) {
  const { user } = useAuth();
  const { createNewYatra } = useYatraData();

  const [name, setName] = useState("");
  const [startPlace, setStartPlace] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("2026-08-10");
  const [endDate, setEndDate] = useState("2026-08-15");
  const [fare, setFare] = useState("2000");
  const [organizerName, setOrganizerName] = useState(user?.name || "Ritesh Kumar");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startPlace.trim() || !destination.trim() || !fare) return;

    setLoading(true);
    try {
      await createNewYatra({
        name: name.trim(),
        startPlace: startPlace.trim(),
        destination: destination.trim(),
        startDate,
        endDate,
        fare: Number(fare) || 2000,
        organizerId: user?.id || "org-1",
        organizerName: organizerName.trim(),
        description: description.trim(),
        sahayakIds: [],
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create New Yatra"
      subtitle="Configure yatra route, dates, and per-person standard fare"
      onClose={onClose}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Yatra Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Yatra Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Flag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter the trip name"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Route: Start place & Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Starting Place <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={startPlace}
                onChange={(e) => setStartPlace(e.target.value)}
                placeholder="Aaspur Shiv Mandir"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Destination <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Haridwar"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Start Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              End Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Standard Fare & Organizer Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Per Person Fare (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="number"
                min="100"
                required
                value={fare}
                onChange={(e) => setFare(e.target.value)}
                placeholder="2000"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Organizer Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                placeholder="Ritesh Kumar"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Description / Notes <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter trip description"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
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
            disabled={loading || !name.trim() || !fare}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-bold shadow-md shadow-orange-950/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{loading ? "Creating..." : "Create Yatra"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
