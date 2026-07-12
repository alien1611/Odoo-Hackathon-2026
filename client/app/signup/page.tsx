// client/app/signup/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupFormValues } from "@/features/auth/schemas";
import { api } from "@/lib/axios";
import Link from "next/link";
import { User, Mail, Phone, KeyRound, AlertTriangle, Sun, Moon } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 relative transition-colors duration-300">
      {/* Top Right Theme Toggle */}
      <div className="absolute top-6 right-6">
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-350 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"
        >
          {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
        </button>
      </div>

      <div className="max-w-md w-full p-8 apple-card border border-slate-200 dark:border-slate-800/80 relative">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create an Account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Join the ERP system as an Employee</p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-650 dark:text-red-400 text-xs font-semibold rounded-md flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-400" />
              </span>
              <input
                {...register("name")}
                type="text"
                required
                placeholder="John Doe"
                className="apple-input pl-10"
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </span>
              <input
                {...register("email")}
                type="email"
                required
                placeholder="name@company.com"
                className="apple-input pl-10"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Phone Number (Optional)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-slate-400" />
              </span>
              <input
                {...register("phone")}
                type="tel"
                placeholder="+1 234 567 890"
                className="apple-input pl-10"
              />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-4 w-4 text-slate-400" />
              </span>
              <input
                {...register("password")}
                type="password"
                required
                placeholder="••••••••"
                className="apple-input pl-10"
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full apple-button py-2.5 text-sm font-semibold shadow-sm mt-2"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 font-semibold">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}