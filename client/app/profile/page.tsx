// client/app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Shield, 
  Save, 
  Loader2, 
  CheckCircle,
  AlertCircle
} from "lucide-react";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  designation: z.string().optional(),
});

type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  designation: string | null;
  role: string;
  status: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
  });

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/auth/profile");
      if (response.data.success) {
        const u = response.data.data;
        setProfile(u);
        
        // Pre-fill form values
        setValue("name", u.name);
        setValue("phone", u.phone || "");
        setValue("designation", u.designation || "");
      }
    } catch (err) {
      setError("Failed to fetch user profile details.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onSubmit = async (data: UpdateProfileValues) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      // Clean payload: remove empty strings
      const payload = {
        name: data.name,
        phone: data.phone || null,
        designation: data.designation || null
      };

      const response = await api.patch("/auth/profile", payload);
      if (response.data.success) {
        setSuccess("Profile settings updated successfully!");
        setProfile(response.data.data);
        
        // Update stored user object as well
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          userObj.name = response.data.data.name;
          userObj.designation = response.data.data.designation;
          localStorage.setItem("user", JSON.stringify(userObj));
        }
      }
    } catch (err) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse.response?.data?.message || "Failed to update profile settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto flex justify-center items-center py-20 bg-white dark:bg-[#15181D] border border-slate-200/50 dark:border-white/5 rounded-3xl">
          <Loader2 className="h-8 w-8 text-[#007AFF] animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error && !profile) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto p-8 text-center bg-white dark:bg-[#15181D] border border-slate-200/50 dark:border-white/5 rounded-3xl">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-655 dark:text-red-400 font-extrabold mb-2">Error</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">{error}</p>
          <button 
            onClick={fetchProfile}
            className="apple-btn apple-btn-primary px-6 py-2"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 animate-page-enter">
        
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">User Profile</h1>
          <p className="text-xs text-slate-455 mt-1">Manage personal contact details, roles, and session credentials.</p>
        </div>

        {/* Status Alerts */}
        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2.5">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/15 text-red-655 dark:text-red-400 text-xs font-bold rounded-2xl flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left panel - User Avatar & Role */}
          <div className="premium-card p-6 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#007AFF] to-[#8B5CF6] text-white flex items-center justify-center font-extrabold text-2xl mb-4 shadow-lg shadow-blue-500/20">
              {profile?.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <h3 className="font-extrabold text-lg tracking-tight text-foreground">{profile?.name}</h3>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1.5">{profile?.designation || "Title unassigned"}</p>
            
            <div className="w-full border-t border-slate-100/50 dark:border-white/5 mt-6 pt-6 space-y-4 text-left text-xs">
              <div className="flex items-center gap-3">
                <Shield className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-450 uppercase font-extrabold tracking-wider block">Security Context</span>
                  <span className="font-bold text-foreground mt-0.5 inline-block">{profile?.role.replace("_", " ")}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-450 uppercase font-extrabold tracking-wider block">Corporate Email</span>
                  <span className="font-bold text-foreground mt-0.5 inline-block">{profile?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel - Profile Edit Form */}
          <div className="md:col-span-2 premium-card p-6">
            <h3 className="text-base font-extrabold tracking-tight border-b border-slate-100/50 dark:border-white/5 pb-4 mb-6">Profile Settings</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    {...register("name")}
                    type="text"
                    className="glass-input pl-10"
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold text-[#64748B] dark:text-slate-500 uppercase tracking-wider pl-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    {...register("phone")}
                    type="text"
                    className="glass-input pl-10"
                    placeholder="Enter phone number..."
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.phone.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold text-slate-455 dark:text-slate-500 uppercase tracking-wider pl-1">
                  Corporate Designation
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    {...register("designation")}
                    type="text"
                    className="glass-input pl-10"
                    placeholder="e.g. Lead Engineer"
                  />
                </div>
                {errors.designation && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.designation.message}</p>}
              </div>

              <div className="pt-4 border-t border-slate-100/50 dark:border-white/5 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving || !isDirty}
                  className="apple-btn apple-btn-primary px-5 py-2.5 disabled:opacity-40"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
