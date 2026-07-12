// client/app/forgot-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import Link from "next/link";
import { 
  ArrowLeft, 
  Mail, 
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Loader2
} from "lucide-react";

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
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F7F8FC] apple-auth-bg text-[#0F172A] relative overflow-hidden select-none font-sans">
      
      {/* Premium Layered Background (5 Slow Animated Blobs) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="apple-auth-blob apple-blob-sky" />
        <div className="apple-auth-blob apple-blob-lavender" />
        <div className="apple-auth-blob apple-blob-purple" />
        <div className="apple-auth-blob apple-blob-cyan" />
        <div className="apple-auth-blob apple-blob-pink" />
      </div>

      {/* LEFT PANEL (45% width on desktop) - Abstract Glass Illustration */}
      <div className="hidden md:flex md:w-[45%] flex-col justify-between p-16 relative z-10 border-r border-[#E2E8F0]/40">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#5B8CFF] to-[#7B61FF] flex items-center justify-center text-white shadow-lg shadow-blue-500/10">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0F172A]">AssetFlow</span>
        </div>

        {/* Abstract 3D Glass Geometry Area */}
        <div className="relative py-16 flex items-center justify-center w-full">
          <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-[#5B8CFF]/8 via-[#7B61FF]/8 to-[#A78BFA]/8 blur-[50px] animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="relative w-64 h-64 rounded-[32px] border border-white/80 bg-white/20 backdrop-blur-[24px] shadow-xl flex items-center justify-center p-6 transition-all duration-500 hover:scale-[1.02]">
            <div className="absolute w-40 h-40 rounded-full border border-white/90 bg-gradient-to-tr from-[#5B8CFF]/10 to-[#A78BFA]/10 shadow-inner flex items-center justify-center animate-[spin_40s_linear_infinite]">
              <div className="w-12 h-12 rounded-2xl bg-white/50 backdrop-blur-[4px] border border-white/80 flex items-center justify-center shadow-sm">
                <Sparkles className="h-6 w-6 text-[#5B8CFF]" />
              </div>
            </div>
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/30 backdrop-blur-[12px] border border-white/80 shadow-md animate-[bounce_6s_infinite_alternate]" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/25 backdrop-blur-[16px] border border-white/80 shadow-md animate-[bounce_8s_infinite_alternate]" />
          </div>
        </div>

        {/* Tagline */}
        <div className="space-y-1">
          <p className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-widest">Enterprise Platform</p>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] mt-1.5">
            Smarter Asset Management.
          </h2>
        </div>
      </div>

      {/* RIGHT PANEL (55% width on desktop) - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:p-16 relative z-10">
        <div className="w-full max-w-md apple-glass-card p-8 sm:p-10 rounded-[28px] space-y-8">
          
          {/* Header */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight text-[#0F172A]">Reset Password</h3>
            <p className="text-xs font-medium text-[#64748B]">Enter your email to retrieve reset credentials</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-650 text-xs font-semibold rounded-2xl flex items-center gap-2.5">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider pl-1">Email Address</label>
                <div className="relative w-full">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-[#64748B]" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 apple-glass-input rounded-2xl text-[#0F172A] placeholder-[#64748B]/50 focus:outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-2xl apple-btn-gradient text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating Token...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              <div className="p-5 bg-emerald-500/5 border border-[#10B981]/15 rounded-2xl space-y-3 text-left">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Reset Token Generated!</span>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed font-semibold">
                  Under real-world conditions, an email would be delivered. For this Hackathon demonstration, we have generated your token below:
                </p>
                {resetToken && (
                  <div className="mt-3">
                    <span className="text-[9px] uppercase font-bold text-[#64748B] block mb-1">Generated Token</span>
                    <div className="bg-[#1C1C1E] p-3 rounded-xl font-mono text-[10px] text-emerald-400 break-all select-all border border-slate-800 max-h-24 overflow-y-auto">
                      {resetToken}
                    </div>
                  </div>
                )}
              </div>

              {resetToken && (
                <Link 
                  href={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                  className="w-full h-14 rounded-2xl apple-btn-gradient text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  Proceed to Reset Password
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}

          {/* Bottom links */}
          <div className="text-center text-xs text-[#64748B] font-semibold border-t border-[#E2E8F0]/80 pt-6">
            <Link href="/login" className="inline-flex items-center gap-1.5 hover:text-[#0F172A] transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}

function CheckCircle2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
