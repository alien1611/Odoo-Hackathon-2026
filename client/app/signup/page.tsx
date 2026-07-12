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
  EyeOff
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Force Light mode for authentication pages to keep a pristine white/light gray aesthetic
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

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
      <div className="flex-1 flex items-center justify-center p-8 sm:p-16 md:p-16 relative z-10 overflow-y-auto">
        <div className="w-full max-w-md p-10 wwdc-card relative my-8">
          
          {/* Header */}
          <div className="space-y-2 mb-6">
            <h3 className="text-3xl font-bold tracking-tight text-slate-900">Create an Account</h3>
            <p className="text-sm font-medium text-slate-500">Join the ERP platform as an employee</p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-red-50/70 border border-red-200 text-red-650 text-xs font-semibold rounded-2xl flex items-center gap-2.5">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  {...register("name")}
                  type="text"
                  required
                  placeholder="John Doe"
                  className="wwdc-input wwdc-input-with-icon"
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name.message}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  {...register("email")}
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="wwdc-input wwdc-input-with-icon"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email.message}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Phone Number (Optional)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="+1 234 567 890"
                  className="wwdc-input wwdc-input-with-icon"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="wwdc-input wwdc-input-with-icon pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-655"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password.message}</p>}
              
              {/* Strength Meter */}
              {passwordVal && (
                <div className="mt-2 space-y-1 pl-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Password Strength</span>
                    <span className="text-slate-600 font-bold">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                  </div>
                </div>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start pl-1">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4.5 w-4.5 mt-0.5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 bg-white transition-colors cursor-none"
              />
              <label htmlFor="terms" className="ml-2 block text-xs font-semibold text-slate-550 select-none leading-relaxed">
                I accept the <Link href="#" className="text-blue-650 font-bold hover:underline">Terms</Link> and <Link href="#" className="text-blue-650 font-bold hover:underline">Privacy Policy</Link>.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full wwdc-button py-3 text-sm font-semibold shadow-md mt-4 cursor-none"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Bottom links */}
          <div className="mt-6 text-center text-sm text-slate-500 font-semibold border-t border-slate-100/80 pt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-bold hover:underline">
              Sign In
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}