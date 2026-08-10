"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import type { UserRole } from "@/types/yatra";
import {
  Compass,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Sparkles,
  Users,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const { success, error } = useToast();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<UserRole>("organizer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!name.trim()) {
          error("Please enter your full name.");
          setLoading(false);
          return;
        }
        if (!email.trim() || !password) {
          error("Email and password are required.");
          setLoading(false);
          return;
        }
        await register(name, email, password, role, phone);
        success(`Welcome to YatraSetu, ${name}!`);
      } else {
        if (!email.trim() || !password) {
          error("Email and password are required.");
          setLoading(false);
          return;
        }
        const profile = await login(email, password);
        success(`Welcome back, ${profile.name}!`);
      }
      router.push("/");
    } catch (err: any) {
      error(err?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-bold">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                Yatra<span className="text-amber-400">Setu</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                  PRO
                </span>
              </span>
              <p className="text-xs text-slate-400">Group Financial Ledger & Management System</p>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Cloud Firebase Edition
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center my-auto">
        {/* Left Side: Value Proposition */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Digital Ledger for Group Yatras & Tours
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            Transparent Financial Ledger for <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300">Yatra Groups</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Eliminate manual registers and physical diaries. Track member dues, partial deposits, real-time expenses, and generate instant printable balance sheets.
          </p>

          {/* Feature Highlights Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Core Ledger Features</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                <span className="text-amber-400 font-bold">👑</span>
                <div>
                  <div className="font-bold text-white">Admin</div>
                  <div className="text-[11px] text-slate-400">Create trips, set fares, invite Sahayaks & export reports.</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">🤝</span>
                <div>
                  <div className="font-bold text-white">Manager</div>
                  <div className="text-[11px] text-slate-400">Record cash/UPI payments & log on-trip expenses in real time.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
              <Users className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-xs font-bold text-white">Members Directory</div>
              <div className="text-[10px] text-slate-400">With phone & seat notes</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
              <Receipt className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-xs font-bold text-white">Payment Ledger</div>
              <div className="text-[10px] text-slate-400">Partial & full tracking</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
              <FileSpreadsheet className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <div className="text-xs font-bold text-white">Final Report</div>
              <div className="text-[10px] text-slate-400">Printable ledger sheet</div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="lg:col-span-6 max-w-md w-full mx-auto">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden backdrop-blur-xl">
            {/* Top Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  mode === "signin"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  mode === "signup"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
                  {/* Role Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Your Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole("organizer")}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          role === "organizer"
                            ? "bg-amber-500/20 border-amber-500 text-amber-300"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        👑 Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("sahayak")}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          role === "sahayak"
                            ? "bg-blue-500/20 border-blue-500 text-blue-300"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        🤝 Sahayak
                      </button>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Sharma"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. organizer@yatrasetu.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === "signin" ? "Sign In" : "Create Account & Proceed"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
              {mode === "signin" ? (
                <span>
                  Do not have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    Register Now
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950/80 py-4 text-center text-xs text-slate-400">
        <p>© 2026 YatraSetu • Digital Group Ledger System</p>
      </footer>
    </div>
  );
}
