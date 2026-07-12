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
        <div className="max-w-3xl mx-auto flex justify-center items-center py-20 bg-white border border-slate-200 rounded-lg">
          <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error && !profile) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto p-8 text-center bg-white border border-slate-200 rounded-lg">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 font-semibold mb-2">Error</p>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <button 
            onClick={fetchProfile}
            className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your employee information and system credentials</p>
        </div>

        {/* Status Alerts */}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-md flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold">{success}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left panel - User Avatar & Role */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-3xl mb-4">
              {profile?.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <h3 className="font-bold text-lg text-slate-900">{profile?.name}</h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">{profile?.designation || "Title unassigned"}</p>
            
            <div className="w-full border-t border-slate-100 mt-6 pt-6 space-y-3.5 text-left text-sm text-slate-600">
              <div className="flex items-center gap-2.5">
                <Shield className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Authorization Role</span>
                  <span className="font-semibold text-slate-800">{profile?.role.replace("_", " ")}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Corporate Email</span>
                  <span className="font-semibold text-slate-800">{profile?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel - Profile Edit Form */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">Profile Settings</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    {...register("name")}
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-slate-350 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-semibold text-slate-700"
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    {...register("phone")}
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-slate-350 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-semibold text-slate-700"
                    placeholder="Enter phone number..."
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                  Corporate Designation
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    {...register("designation")}
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-slate-350 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-semibold text-slate-700"
                    placeholder="e.g. Lead Engineer"
                  />
                </div>
                {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation.message}</p>}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving || !isDirty}
                  className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm font-semibold flex items-center gap-2 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes
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
