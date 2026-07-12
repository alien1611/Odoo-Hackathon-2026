// client/app/forgot-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, KeyRound, Sun, Moon } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 relative transition-colors duration-300">
      {/* Top Right Theme Toggle */}
      <div className="absolute top-6 right-6">
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-350 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"
        >
          {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
        </button>
      </div>

      <div className="max-w-md w-full p-8 apple-card border border-slate-200 dark:border-slate-800/80 relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 dark:bg-zinc-900 mb-4">
            <KeyRound className="h-6 w-6 text-slate-700 dark:text-zinc-350" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reset Password</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Enter your email to retrieve reset credentials</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-650 dark:text-red-400 text-xs font-semibold rounded-md">
            {error}
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
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
                  className="apple-input apple-input-with-icon"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full apple-button py-2.5 text-sm font-semibold shadow-sm"
            >
              {isLoading ? "Generating Token..." : "Send Reset Code"}
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 rounded-lg space-y-2 text-left">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5" />
                <span>Reset Token Generated!</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Under real-world conditions, an email would be delivered. For this Hackathon demonstration, we have generated your token below:
              </p>
              {resetToken && (
                <div className="mt-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Generated Token</span>
                  <div className="bg-slate-905 dark:bg-black p-2.5 rounded font-mono text-[10px] text-emerald-600 dark:text-emerald-400 break-all select-all border border-slate-200 dark:border-slate-800 max-h-24 overflow-y-auto">
                    {resetToken}
                  </div>
                </div>
              )}
            </div>

            {resetToken && (
              <Link 
                href={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                className="w-full flex items-center justify-center apple-button py-2.5 text-sm font-semibold shadow-sm"
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
