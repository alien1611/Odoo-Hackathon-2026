// client/app/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupFormValues } from "@/features/auth/schemas";
import { api } from "@/lib/axios";
import Link from "next/link";
import { User, Mail, Phone, KeyRound, AlertTriangle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-500">
      {/* Floating Animated Backdrop blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="float-bubble w-[450px] h-[450px] bg-blue-400/20 top-10 left-10" />
        <div className="float-bubble w-96 h-96 bg-purple-400/20 bottom-10 right-10" style={{ animationDelay: "-3s" }} />
      </div>

      <div className="max-w-md w-full p-8 glass-card rounded-2xl shadow-xl z-10 border border-slate-200/50 dark:border-slate-800/50 relative">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create an Account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Join the ERP system as an Employee</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50/70 border border-red-200 text-red-650 text-xs font-semibold rounded-md flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-400" />
              </span>
              <input
                {...register("name")}
                type="text"
                placeholder="John Doe"
                className="w-full pl-10 pr-3 py-2 border border-slate-350 dark:border-slate-800 dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-sm"
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name.message}</p>}
          </div>

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
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number (Optional)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-slate-400" />
              </span>
              <input
                {...register("phone")}
                type="tel"
                placeholder="+1 234 567 890"
                className="w-full pl-10 pr-3 py-2 border border-slate-350 dark:border-slate-800 dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-sm"
              />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-4 w-4 text-slate-400" />
              </span>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2 border border-slate-350 dark:border-slate-800 dark:bg-slate-900 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-sm"
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 dark:bg-white dark:text-slate-950 text-white py-2.5 px-4 rounded-md hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-colors mt-6 font-bold text-sm shadow-sm"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500 font-semibold">
          Already have an account?{" "}
          <Link href="/login" className="text-slate-900 dark:text-white font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}