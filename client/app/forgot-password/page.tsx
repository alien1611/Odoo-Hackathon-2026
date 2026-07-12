// client/app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post("/auth/forgot-password", { email });
      if (response.data.success) {
        setSuccess(true);
        // Save token for user convenience in testing
        if (response.data.data?.resetTokenPlaceholder) {
          setResetToken(response.data.data.resetTokenPlaceholder);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to request password reset.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-500">
      {/* Floating Animated Backdrop blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="float-bubble w-96 h-96 bg-blue-400/20 top-20 left-10" />
        <div className="float-bubble w-80 h-80 bg-purple-400/20 bottom-20 right-1/4" style={{ animationDelay: "-4s" }} />
      </div>

      <div className="max-w-md w-full p-8 glass-card rounded-2xl shadow-xl z-10 border border-slate-200/50 dark:border-slate-800/50 relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-900 mb-4">
            <KeyRound className="h-6 w-6 text-slate-700 dark:text-slate-350" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Password</h1>
          <p className="text-sm text-slate-550 dark:text-slate-400 mt-2">Enter your email to retrieve reset credentials</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50/70 border border-red-200 text-red-650 text-xs font-semibold rounded-md">
            {error}
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="e.g. admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-800 dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 dark:bg-white dark:text-slate-950 text-white py-2 px-4 rounded-md hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-colors font-bold text-sm shadow-sm"
            >
              {isLoading ? "Generating Token..." : "Send Reset Code"}
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-2 text-left">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5" />
                <span>Reset Token Generated!</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Under real-world conditions, an email would be delivered. For this Hackathon demonstration, we have generated your token below:
              </p>
              {resetToken && (
                <div className="mt-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Generated Token</span>
                  <div className="bg-slate-900 p-2.5 rounded font-mono text-[10px] text-emerald-400 break-all select-all border border-slate-800 max-h-24 overflow-y-auto">
                    {resetToken}
                  </div>
                </div>
              )}
            </div>

            {resetToken && (
              <Link 
                href={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                className="w-full flex items-center justify-center bg-slate-900 dark:bg-white dark:text-slate-950 text-white py-2.5 rounded-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors font-bold text-sm shadow-sm"
              >
                Proceed to Reset Password
              </Link>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
