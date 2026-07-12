// client/app/reset-password/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/axios";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post("/auth/reset-password", {
        token,
        password
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password. Check if token is expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full p-8 glass-card rounded-2xl shadow-xl z-10 border border-slate-200/50 dark:border-slate-800/50 relative">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-900 mb-4">
          <Lock className="h-6 w-6 text-slate-700 dark:text-slate-350" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Password</h1>
        <p className="text-sm text-slate-550 dark:text-slate-400 mt-2">Enter your reset token and your new credentials</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50/70 border border-red-200 text-red-650 text-xs font-semibold rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-50/75 border border-emerald-250 text-emerald-700 text-xs font-bold rounded-md flex items-center gap-2">
          <ShieldCheck className="h-4.5 w-4.5" />
          <span>Password reset successfully! Redirecting to sign in...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reset Token</label>
          <textarea
            required
            rows={2}
            placeholder="Paste your reset token here..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-800 dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-xs font-mono resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">New Password</label>
          <input
            type="password"
            required
            placeholder="Min 8 chars, 1 uppercase, 1 digit"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-800 dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Confirm Password</label>
          <input
            type="password"
            required
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-800 dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || success}
          className="w-full bg-slate-900 dark:bg-white dark:text-slate-950 text-white py-2 px-4 rounded-md hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-colors font-bold text-sm shadow-sm"
        >
          {isLoading ? "Updating Password..." : "Reset Password"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-500">
      {/* Floating Animated Backdrop blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="float-bubble w-96 h-96 bg-blue-400/20 top-20 left-10" />
        <div className="float-bubble w-80 h-80 bg-purple-400/20 bottom-20 right-1/4" style={{ animationDelay: "-4s" }} />
      </div>

      <Suspense fallback={
        <div className="max-w-md w-full p-8 glass-card rounded-2xl shadow-xl z-10 border border-slate-200/50 dark:border-slate-800/50 text-center text-slate-500">
          Loading reset password panel...
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
