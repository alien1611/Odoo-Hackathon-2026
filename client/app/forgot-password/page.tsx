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
  Sparkles,
  ArrowRight,
  AlertTriangle
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Force Light mode for authentication pages to keep a pristine white/light gray aesthetic
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F7F8FC] relative overflow-hidden transition-colors duration-300 select-none">
      
      {/* Premium Layered Background (5 Animated Blobs) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="wwdc-bg-blob wwdc-blob-1" />
        <div className="wwdc-bg-blob wwdc-blob-2" />
        <div className="wwdc-bg-blob wwdc-blob-3" />
        <div className="wwdc-bg-blob wwdc-blob-4" />
        <div className="wwdc-bg-blob wwdc-blob-5" />
      </div>

      {/* LEFT PANEL (45% width on desktop) - Artistic Vision Pro Style */}
      <div className="w-full md:w-[45%] flex flex-col justify-between p-12 sm:p-16 md:p-24 relative z-10 select-none">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">AssetFlow</span>
        </div>

        {/* Abstract 3D Glass Geometry Area */}
        <div className="relative py-16 flex items-center justify-center">
          <div className="absolute w-64 h-64 rounded-full border border-white/50 bg-white/5 backdrop-blur-[2px] shadow-2xl animate-[spin_30s_linear_infinite]" />
          <div className="absolute w-40 h-40 rounded-full border border-white/40 bg-gradient-to-tr from-blue-300/10 to-indigo-300/10 backdrop-blur-[6px] shadow-xl animate-[pulse_6s_ease-in-out_infinite]" />
          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-tr from-pink-300/20 to-purple-400/20 backdrop-blur-[10px] border border-white/60 shadow-lg translate-x-16 -translate-y-16 animate-[bounce_8s_infinite]" />
        </div>

        {/* Tagline */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
            Smarter Asset Management.
          </h2>
        </div>
      </div>

      {/* RIGHT PANEL (55% width on desktop) - Authentication Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 md:p-24 relative z-10">
        <div className="w-full max-w-md p-10 wwdc-card relative">
          
          {/* Header */}
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Reset Password</h2>
            <p className="text-sm font-medium text-slate-500">Enter your email to retrieve reset credentials</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50/70 border border-red-200 text-red-650 text-xs font-semibold rounded-2xl flex items-center gap-2.5">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4.5 w-4.5 text-slate-400" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="e.g. admin@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="wwdc-input wwdc-input-with-icon"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full wwdc-button py-3 text-sm font-semibold shadow-md cursor-none"
              >
                {isLoading ? "Generating Token..." : "Send Reset Link"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-xl space-y-3 text-left">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Reset Token Generated!</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Under real-world conditions, an email would be delivered. For this Hackathon demonstration, we have generated your token below:
                </p>
                {resetToken && (
                  <div className="mt-3">
                    <span className="text-[9px] uppercase font-bold text-slate-450 block mb-1">Generated Token</span>
                    <div className="bg-[#1C1C1E] p-2.5 rounded-lg font-mono text-[9px] text-emerald-400 break-all select-all border border-slate-800 max-h-24 overflow-y-auto">
                      {resetToken}
                    </div>
                  </div>
                )}
              </div>

              {resetToken && (
                <Link 
                  href={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                  className="w-full flex items-center justify-center wwdc-button py-3 text-sm font-semibold shadow-md cursor-none"
                >
                  Proceed to Reset Password
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}

          <div className="mt-8 text-center border-t border-slate-100/80 pt-6">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
