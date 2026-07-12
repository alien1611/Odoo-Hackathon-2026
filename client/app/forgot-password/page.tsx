// client/app/forgot-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import Link from "next/link";
import { 
  ArrowLeft, 
  Mail, 
  CheckCircle2, 
  KeyRound, 
  Sun, 
  Moon, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Sync theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post("/auth/forgot-password", { email });
      if (response.data.success) {
        setSuccess(true);
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] dark:bg-black transition-colors duration-300 relative overflow-hidden">
      
      {/* Top Right Theme Toggle (Absolute) */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-full border border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm text-slate-700 dark:text-zinc-350 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"
        >
          {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
        </button>
      </div>

      {/* LEFT PANEL (40% width on desktop) */}
      <div className="w-full md:w-[40%] flex flex-col justify-between p-8 sm:p-12 md:p-16 bg-white/40 dark:bg-zinc-950/40 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800/40 relative z-10 backdrop-blur-md">
        
        {/* Top Branding Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">AssetFlow ERP</h1>
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-blue-600 dark:text-blue-400">Enterprise Edition</p>
            </div>
          </div>
          
          <div className="pt-8 space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Enterprise Asset Management Platform
            </h2>
            <p className="text-sm text-slate-555 dark:text-slate-450 leading-relaxed font-medium">
              Helping organizations manage their physical assets, allocations, bookings, and audits securely and efficiently.
            </p>
          </div>
        </div>

        {/* Feature Check List */}
        <div className="py-8 space-y-4">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-200/50">✓</span>
            <span>Real-time Asset Tracking</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-200/50">✓</span>
            <span>Conflict-free Bookings Calendar</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-200/50">✓</span>
            <span>Automated Maintenance Approval</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-200/50">✓</span>
            <span>Role-Based Audit Verification</span>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 font-semibold pt-6 border-t border-slate-100 dark:border-slate-800">
          <span>v1.0.0</span>
          <span>Made for Odoo Hackathon</span>
        </div>
      </div>

      {/* RIGHT PANEL (60% width on desktop) */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 md:p-24 relative z-10">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Reset Password</h2>
            <p className="text-sm font-medium text-slate-505 dark:text-slate-400">Enter your email to retrieve reset credentials</p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-650 dark:text-red-400 text-xs font-semibold rounded-xl flex items-center gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4.5 w-4.5 text-slate-450 dark:text-slate-550" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="e.g. admin@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="enterprise-input enterprise-input-with-icon"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-enterprise py-3 font-bold text-sm shadow-md cursor-none"
              >
                {isLoading ? "Generating Token..." : "Send Reset Link"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 rounded-xl space-y-3 text-left">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Reset Token Generated!</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  Under real-world conditions, an email would be delivered. For this Hackathon demonstration, we have generated your token below:
                </p>
                {resetToken && (
                  <div className="mt-3">
                    <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Generated Token</span>
                    <div className="bg-slate-905 dark:bg-black p-2.5 rounded-lg font-mono text-[9px] text-emerald-600 dark:text-emerald-400 break-all select-all border border-slate-200 dark:border-slate-805 max-h-24 overflow-y-auto">
                      {resetToken}
                    </div>
                  </div>
                )}
              </div>

              {resetToken && (
                <Link 
                  href={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                  className="w-full flex items-center justify-center btn-enterprise py-3 font-bold text-sm shadow-md cursor-none"
                >
                  Proceed to Reset Password
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}

          <div className="mt-6 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-550 hover:text-slate-900 dark:hover:text-white font-semibold">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
