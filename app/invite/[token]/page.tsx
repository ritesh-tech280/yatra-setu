"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  Mail,
  User,
  Lock,
} from "lucide-react";
import { auth } from "@/config/firebaseConfig";
import { useAuth } from "@/context/AuthContext";
import { useYatraData } from "@/context/YatraContext";
import { fetchInvitationByToken, acceptYatraInvitation } from "@/lib/firebase/firestoreService";
import type { YatraInvitation } from "@/types/yatra";

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const router = useRouter();
  const { user, login, register, loading: authLoading } = useAuth();
  const { setActiveYatraId, refreshData } = useYatraData();

  const [invitation, setInvitation] = useState<YatraInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");

  // Inline auth inputs if unauthenticated
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Load invitation details
  useEffect(() => {
    async function loadInvite() {
      if (!token) {
        setError("Invalid invitation token.");
        setLoading(false);
        return;
      }
      try {
        const inv = await fetchInvitationByToken(token);
        if (!inv) {
          setError("This invitation was not found or has expired.");
        } else {
          setInvitation(inv);
          if (inv.email) setEmail(inv.email);
          if (inv.name) setName(inv.name);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load invitation.");
      } finally {
        setLoading(false);
      }
    }
    loadInvite();
  }, [token]);

  const accept = async (activeUser = user) => {
    if (!token || !invitation) return;
    setSubmitting(true);
    setError(null);

    try {
      let idToken: string | undefined = undefined;
      if (auth?.currentUser) {
        try {
          idToken = await auth.currentUser.getIdToken();
        } catch {}
      }

      const uid = activeUser?.id || (activeUser as any)?.uid || auth?.currentUser?.uid || "sahayak";

      // 1. Call accept API
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: {
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitationToken: token,
          token,
          uid,
          name: activeUser?.name || invitation.name,
          email: activeUser?.email || invitation.email,
          phone: activeUser?.phone || invitation.phone,
        }),
      });

      // 2. Also record in client Firestore service
      await acceptYatraInvitation(token, {
        uid,
        name: activeUser?.name || invitation.name || "Sahayak",
        email: activeUser?.email || invitation.email,
        phone: activeUser?.phone || invitation.phone,
      });

      // 3. Switch active Yatra & navigate to dashboard
      setActiveYatraId(invitation.yatraId);
      if (refreshData) {
        await refreshData();
      }

      router.replace("/");
    } catch (err: any) {
      setError(err?.message || "Could not accept invitation.");
      setSubmitting(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSubmitting(true);

    try {
      let loggedUser = null;
      if (authMode === "register") {
        if (!name.trim()) {
          setAuthError("Please enter your full name.");
          setSubmitting(false);
          return;
        }
        loggedUser = await register(name.trim(), email.trim(), password);
      } else {
        loggedUser = await login(email.trim(), password);
      }

      if (loggedUser) {
        await accept(loggedUser);
      }
    } catch (err: any) {
      setAuthError(err?.message || "Authentication failed. Please check credentials.");
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/20 animate-pulse mb-4">
          🚩
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Verifying Yatra Invitation...</span>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto text-2xl">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-white">Invitation Invalid or Expired</h2>
          <p className="text-sm text-slate-400">
            {error || "This Sahayak invitation link is invalid or has already been used."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
          >
            Go to YatraSetu Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-amber-500/15 via-orange-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10">
        {/* Header Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Manager Invitation</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Join as a Sahayak
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {invitation?.organizerName ? (
              <>
                <strong className="text-amber-400">{invitation.organizerName}</strong> invited you to manage{" "}
                <strong className="text-white">&ldquo;{invitation.yatraName}&rdquo;</strong>.
              </>
            ) : (
              "You have been invited to help manage this Yatra group."
            )}
          </p>
        </div>

        {/* Benefits Box */}
        <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Record payments & update member ledger</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Log travel, food, and miscellaneous expenses</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>View live finances and generate printable reports</span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Authenticated user button */}
        {user ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-white">{user.name}</p>
                  <p className="text-[11px] text-slate-400">{user.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md">
                Logged In
              </span>
            </div>

            <button
              onClick={() => accept(user)}
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Joining Yatra...</span>
                </>
              ) : (
                <>
                  <span>Accept Invitation & Open Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                {authError}
              </div>
            )}

            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300">
                {authMode === "register" ? "Create your Sahayak account" : "Sign in to accept"}
              </span>
              <button
                type="button"
                onClick={() => setAuthMode(authMode === "register" ? "login" : "register")}
                className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
              >
                {authMode === "register" ? "Have an account? Log In" : "New? Register"}
              </button>
            </div>

            {authMode === "register" && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Accepting & Joining...</span>
                </>
              ) : (
                <>
                  <span>Accept Invitation & Join Yatra</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
