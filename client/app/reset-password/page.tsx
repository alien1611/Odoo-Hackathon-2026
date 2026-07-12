// client/app/reset-password/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/axios";
import Link from "next/link";
import { 
  ArrowLeft, 
  Lock, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Sun,
  Moon
} from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const getPasswordStrength = () => {
    if (!password) return { label: "Empty", color: "bg-slate-200", width: "w-0" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 4: return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
      case 3: return { label: "Medium", color: "bg-blue-500", width: "w-3/4" };
      case 2: return { label: "Weak", color: "bg-amber-500", width: "w-1/2" };
      default: return { label: "Very Weak", color: "bg-rose-500", width: "w-1/4" };
    }
  };

  const strength = getPasswordStrength();

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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F7F8FC] dark:bg-black relative overflow-hidden transition-colors duration-300 select-none w-full">
      
      {/* Premium Layered Background (5 Animated Blobs) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="wwdc-bg-blob wwdc-blob-1" />
        <div className="wwdc-bg-blob wwdc-blob-2" />
        <div className="wwdc-bg-blob wwdc-blob-3" />
        <div className="wwdc-bg-blob wwdc-blob-4" />
        <div className="wwdc-bg-blob wwdc-blob-5" />
      </div>

      {/* Top Right Theme Toggle (Absolute) */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-full border border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"
        >
          {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
        </button>
      </div>

      {/* LEFT PANEL (45% width on desktop) - Artistic Vision Pro Style */}
      <div className="w-full md:w-[45%] flex flex-col justify-between p-12 sm:p-16 md:p-24 relative z-10 select-none">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">AssetFlow</span>
        </div>

        {/* Abstract 3D Glass Geometry Area */}
        <div className="relative py-16 flex items-center justify-center">
          <div className="absolute w-64 h-64 rounded-full border border-white/50 dark:border-white/10 bg-white/5 backdrop-blur-[2px] shadow-2xl animate-[spin_30s_linear_infinite]" />
          <div className="absolute w-40 h-40 rounded-full border border-white/45 dark:border-white/10 bg-gradient-to-tr from-blue-300/10 to-indigo-300/10 backdrop-blur-[6px] shadow-xl overflow-hidden flex items-center justify-center animate-[pulse_6s_ease-in-out_infinite]">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover opacity-85 dark:opacity-75" />
          </div>
          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-tr from-pink-300/20 to-purple-400/20 backdrop-blur-[10px] border border-white/60 dark:border-white/10 shadow-lg translate-x-16 -translate-y-16 animate-[bounce_8s_infinite]" />
        </div>

        {/* Tagline */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            Smarter Asset Management.
          </h2>
        </div>
      </div>

      {/* RIGHT PANEL (55% width on desktop) - Authentication Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 md:p-24 relative z-10">
        <div className="w-full max-w-md p-10 wwdc-card relative">
          
          {/* Header */}
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Create New Password</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Enter your reset token and your new credentials</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-650 dark:text-red-400 text-xs font-semibold rounded-2xl flex items-center gap-2.5">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2.5">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
              <span>Password reset successfully! Redirecting to sign in...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Token */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Reset Token</label>
              <textarea
                required
                rows={2}
                placeholder="Paste your reset token here..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono resize-none text-slate-900 dark:text-white shadow-sm"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">New Password</label>
              <input
                type="password"
                required
                placeholder="Min 8 chars, 1 uppercase, 1 digit"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="wwdc-input"
              />
              
              {/* Strength Meter */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    <span>Password Strength</span>
                    <span className="text-slate-600 dark:text-slate-350 font-bold">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Confirm Password</label>
              <input
                type="password"
                required
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="wwdc-input"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full wwdc-button py-3 text-sm font-semibold shadow-md mt-4 cursor-none"
            >
              {isLoading ? "Updating Password..." : "Reset Password"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100/80 dark:border-slate-800/80 pt-6">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-455 hover:text-slate-900 dark:hover:text-white font-semibold">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 text-center text-slate-500 dark:text-zinc-400">
        Loading reset password panel...
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
