// client/app/signup/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupFormValues } from "@/features/auth/schemas";
import { api } from "@/lib/axios";
import Link from "next/link";
import { 
  User, 
  Mail, 
  Phone, 
  KeyRound, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Loader2
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const passwordVal = watch("password", "");

  const getPasswordStrength = () => {
    if (!passwordVal) return { label: "Empty", color: "bg-slate-200", width: "w-0" };
    let score = 0;
    if (passwordVal.length >= 8) score++;
    if (/[A-Z]/.test(passwordVal)) score++;
    if (/[0-9]/.test(passwordVal)) score++;
    if (/[^A-Za-z0-9]/.test(passwordVal)) score++;

    switch (score) {
      case 4: return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
      case 3: return { label: "Medium", color: "bg-blue-500", width: "w-3/4" };
      case 2: return { label: "Weak", color: "bg-amber-500", width: "w-1/2" };
      default: return { label: "Very Weak", color: "bg-rose-500", width: "w-1/4" };
    }
  };

  const strength = getPasswordStrength();

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post('/auth/signup', {
        ...data,
        role: "EMPLOYEE",
      });
      
      if (response.data.success) {
        router.push('/login?registered=true');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An unexpected error occurred during registration");
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
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:p-16 relative z-10 overflow-y-auto">
        <div className="w-full max-w-md apple-glass-card p-8 sm:p-10 rounded-[28px] space-y-6 my-8">
          
          {/* Header */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight text-[#0F172A]">Create an Account</h3>
            <p className="text-xs font-medium text-[#64748B]">Join the ERP platform as an employee</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-2xl flex items-center gap-2.5">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider pl-1">Full Name</label>
              <div className="relative w-full">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center">
                  <User className="h-5 w-5 text-[#64748B]" />
                </span>
                <input
                  {...register("name")}
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full h-14 pl-12 pr-4 apple-glass-input rounded-2xl text-[#0F172A] placeholder-[#64748B]/50 focus:outline-none transition-all text-sm font-medium"
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold pl-1">{errors.name.message}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider pl-1">Email Address</label>
              <div className="relative w-full">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-[#64748B]" />
                </span>
                <input
                  {...register("email")}
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full h-14 pl-12 pr-4 apple-glass-input rounded-2xl text-[#0F172A] placeholder-[#64748B]/50 focus:outline-none transition-all text-sm font-medium"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold pl-1">{errors.email.message}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider pl-1">Phone Number (Optional)</label>
              <div className="relative w-full">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-[#64748B]" />
                </span>
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="+1 234 567 890"
                  className="w-full h-14 pl-12 pr-4 apple-glass-input rounded-2xl text-[#0F172A] placeholder-[#64748B]/50 focus:outline-none transition-all text-sm font-medium"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1 font-semibold pl-1">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider pl-1">Password</label>
              <div className="relative w-full">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center">
                  <KeyRound className="h-5 w-5 text-[#64748B]" />
                </span>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full h-14 pl-12 pr-12 apple-glass-input rounded-2xl text-[#0F172A] placeholder-[#64748B]/50 focus:outline-none transition-all text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold pl-1">{errors.password.message}</p>}
              
              {/* Strength Meter */}
              {passwordVal && (
                <div className="mt-3 space-y-1.5 pl-1">
                  <div className="flex justify-between text-[10px] font-bold text-[#64748B]">
                    <span>Password Strength</span>
                    <span className="font-extrabold">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                  </div>
                </div>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start pl-1 py-1">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 mt-0.5 rounded border-[#E2E8F0] text-[#5B8CFF] focus:ring-[#5B8CFF]/20 bg-white transition-colors cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2.5 block text-xs font-semibold text-[#64748B] cursor-pointer select-none leading-relaxed">
                I accept the <Link href="#" className="text-[#5B8CFF] font-bold hover:underline">Terms</Link> and <Link href="#" className="text-[#5B8CFF] font-bold hover:underline">Privacy Policy</Link>.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl apple-btn-gradient text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom links */}
          <div className="text-center text-xs text-[#64748B] font-semibold border-t border-[#E2E8F0]/80 pt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#5B8CFF] font-bold hover:underline">
              Sign In
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}