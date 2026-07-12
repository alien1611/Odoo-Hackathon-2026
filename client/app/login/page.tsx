// client/app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/features/auth/schemas";
import { api } from "@/lib/axios";
import Link from "next/link";
import { 
  KeyRound, 
  Mail, 
  AlertTriangle, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Eye,
  EyeOff
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', data);
      
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
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
            <p className="text-sm text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
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
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome Back</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Sign in to continue managing your enterprise.</p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-650 dark:text-red-400 text-xs font-semibold rounded-xl flex items-center gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-slate-450 dark:text-slate-550" />
                </span>
                <input
                  {...register("email")}
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="enterprise-input enterprise-input-with-icon"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" className="text-xs text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline font-semibold">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <KeyRound className="h-4.5 w-4.5 text-slate-450 dark:text-slate-550" />
                </span>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="enterprise-input enterprise-input-with-icon pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password.message}</p>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500 bg-white dark:bg-zinc-900 transition-colors"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs font-semibold text-slate-500 dark:text-slate-400 select-none">
                Remember this device
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-enterprise py-3 font-bold text-sm shadow-md cursor-none"
            >
              {isLoading ? "Signing In..." : "Sign In"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Bottom Security / Trust Indicators */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1">🔒 Secure Authentication</span>
            <span className="flex items-center gap-1">🛡️ Enterprise Grade</span>
          </div>

          <div className="text-center text-sm text-slate-500 dark:text-slate-400 font-semibold pt-4">
            New employee?{" "}
            <Link href="/signup" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
              Create an Account
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}