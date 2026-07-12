// client/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/features/auth/schemas";
import { api } from "@/lib/axios";
import Link from "next/link";
import { KeyRound, Mail, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        // Store both token and user object
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-500">
      {/* Floating Animated Backdrop blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="float-bubble w-[450px] h-[450px] bg-blue-400/20 top-10 left-10" />
        <div className="float-bubble w-96 h-96 bg-purple-400/20 bottom-10 right-10" style={{ animationDelay: "-3s" }} />
      </div>

      <div className="max-w-md w-full p-8 glass-card rounded-2xl shadow-xl z-10 border border-slate-200/50 dark:border-slate-800/50 relative">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Welcome back to the ERP system</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50/70 border border-red-200 text-red-650 text-xs font-semibold rounded-md flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </span>
              <input
                {...register("email")}
                type="email"
                placeholder="name@company.com"
                className="w-full pl-10 pr-3 py-2 border border-slate-350 dark:border-slate-800 dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-sm"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <Link href="/forgot-password" className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white hover:underline font-semibold">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-4 w-4 text-slate-400" />
              </span>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2 border border-slate-355 dark:border-slate-800 dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-sm"
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 dark:bg-white dark:text-slate-950 text-white py-2.5 px-4 rounded-md hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-colors mt-6 font-bold text-sm shadow-sm"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500 font-semibold">
          Don't have an account?{" "}
          <Link href="/signup" className="text-slate-900 dark:text-white font-bold hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}