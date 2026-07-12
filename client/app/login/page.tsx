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
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles
} from "lucide-react";

export default function LoginPage() {
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
          {/* Outer Glass Ribbon Graphic */}
          <div className="absolute w-64 h-64 rounded-full border border-white/50 bg-white/5 backdrop-blur-[2px] shadow-2xl animate-[spin_30s_linear_infinite]" />
          {/* Inner Spheres */}
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
      <div className="flex-1 flex items-center justify-center p-8 sm:p-16 md:p-24 relative z-10">
        <div className="w-full max-w-md p-10 wwdc-card relative">
          
          {/* Welcome Text */}
          <div className="space-y-2 mb-8">
            <h3 className="text-3xl font-bold tracking-tight text-slate-900">Welcome Back</h3>
            <p className="text-sm font-medium text-slate-500">Sign in to continue managing your enterprise.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50/70 border border-red-200 text-red-650 text-xs font-semibold rounded-2xl flex items-center gap-2.5">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-slate-400" />
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

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" className="text-xs text-slate-500 hover:text-slate-900 hover:underline font-semibold">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <KeyRound className="h-4.5 w-4.5 text-slate-400" />
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
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-650"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password.message}</p>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center pl-1">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4.5 w-4.5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 bg-white transition-colors cursor-none"
              />
              <label htmlFor="remember-me" className="ml-2.5 block text-xs font-semibold text-slate-550 select-none">
                Remember this device
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full wwdc-button py-3 text-sm font-semibold shadow-md cursor-none"
            >
              {isLoading ? "Signing In..." : "Sign In"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Bottom links */}
          <div className="mt-8 text-center text-sm text-slate-500 font-semibold border-t border-slate-100/80 pt-6">
            New employee?{" "}
            <Link href="/signup" className="text-blue-600 font-bold hover:underline">
              Create an Account
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}