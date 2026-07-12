// client/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { 
  Users, 
  Building2, 
  Tag, 
  Bell, 
  Clock, 
  LogIn, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Calendar,
  Wrench,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  counts: {
    employees: number;
    departments: number;
    categories: number;
    unreadNotifications: number;
  };
  usersByRole: Array<{ role: string; count: number }>;
  employeesByDepartment: Array<{ department: string; count: number }>;
  recentActivity: Array<{
    id: string;
    userId: string;
    action: string;
    module: string;
    description: string;
    createdAt: string;
    user: { name: string; email: string };
  }>;
  latestLogins: Array<{
    id: string;
    userId: string;
    action: string;
    module: string;
    description: string;
    createdAt: string;
    user: { name: string; email: string };
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/dashboard");
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        setError("Failed to load dashboard metrics");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-8 animate-pulse">
          {/* Skeleton Header */}
          <div className="h-10 w-64 bg-slate-200 dark:bg-zinc-800 rounded-2xl"></div>
          
          {/* Asymmetrical Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-44 bg-slate-200 dark:bg-zinc-800 rounded-3xl"></div>
            <div className="h-44 bg-slate-200 dark:bg-zinc-800 rounded-3xl"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-zinc-800 rounded-3xl"></div>
            <div className="h-96 bg-slate-200 dark:bg-zinc-800 rounded-3xl"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !stats) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-12 p-8 text-center bg-white dark:bg-[#15181D] rounded-3xl shadow-2xl border border-slate-250/20 dark:border-white/5 animate-page-enter">
          <p className="text-red-650 dark:text-red-400 font-extrabold text-lg mb-2">Metrics Offline</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">{error || "An error occurred retrieving dashboard data."}</p>
          <button 
            onClick={() => window.location.reload()}
            className="apple-btn apple-btn-primary px-6 py-2.5"
          >
            Reconnect Metrics
          </button>
        </div>
      </Layout>
    );
  }

  const totalUsers = stats.usersByRole.reduce((sum, r) => sum + r.count, 0) || 1;
  const roleColors: Record<string, string> = {
    ADMIN: "#007AFF",
    EMPLOYEE: "#8B5CF6",
    ASSET_MANAGER: "#10B981",
    DEPARTMENT_HEAD: "#F59E0B",
  };

  const maxDeptEmployees = Math.max(...stats.employeesByDepartment.map(d => d.count), 1);

  // SVG Donut Calculations for Roles Chart
  let accumulatedPercentage = 0;
  const donutRadius = 55;
  const donutCircumference = 2 * Math.PI * donutRadius;

  return (
    <Layout>
      <div className="space-y-8 animate-page-enter">
        
        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">System Status Overview</h1>
            <p className="text-xs text-slate-450 dark:text-slate-450 mt-1">Real-time enterprise metrics, role mapping, and audit logs.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-[#007AFF]/8 dark:bg-[#007AFF]/12 border border-[#007AFF]/15 px-3 py-1.5 rounded-full">
            <span className="h-2 w-2 rounded-full bg-[#007AFF] animate-pulse" />
            <span className="text-[10px] font-extrabold text-[#007AFF] uppercase tracking-widest">Live Diagnostics</span>
          </div>
        </div>

        {/* Asymmetrical KPI Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Total Employees (Double Width with Apple Blue mesh look) */}
          <div className="md:col-span-2 premium-card bg-gradient-to-tr from-white/90 to-[#007AFF]/5 dark:from-[#15181D] dark:to-[#007AFF]/10 p-6 flex flex-col justify-between min-h-[190px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-extrabold text-[#007AFF] uppercase tracking-widest">Enterprise Roster</p>
                <h3 className="text-4xl font-extrabold tracking-tight mt-2 text-foreground">
                  {stats.counts.employees}
                </h3>
              </div>
              <div className="p-3 bg-[#007AFF]/10 rounded-2xl text-[#007AFF]">
                <Users className="h-6 w-6" />
              </div>
            </div>
            
            <div className="flex items-end justify-between mt-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-500 font-extrabold">Active</span> roster members
              </div>
              
              {/* Mini Sparkline Chart */}
              <svg className="w-24 h-8 text-[#007AFF]" viewBox="0 0 100 30" fill="none">
                <path 
                  d="M0 25 C 20 20, 40 5, 60 15 S 80 5, 100 2" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <path 
                  d="M0 25 C 20 20, 40 5, 60 15 S 80 5, 100 2 L 100 30 L 0 30 Z" 
                  fill="url(#sparkline-grad)" 
                  opacity="0.1" 
                />
                <defs>
                  <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Card 2: Departments Summary */}
          <div className="premium-card p-6 flex flex-col justify-between min-h-[190px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Active Units</p>
                <h3 className="text-4xl font-extrabold tracking-tight mt-2 text-foreground">
                  {stats.counts.departments}
                </h3>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-655 dark:text-slate-400">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
            
            <div className="mt-4">
              <Link 
                href="/departments" 
                className="text-xs font-bold text-[#007AFF] hover:underline inline-flex items-center gap-1 group"
              >
                Structure Directory
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Card 3: Asset Categories */}
          <div className="premium-card p-6 bg-gradient-to-tr from-white/90 to-[#8B5CF6]/5 dark:from-[#15181D] dark:to-[#8B5CF6]/10 flex flex-col justify-between min-h-[190px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-extrabold text-[#8B5CF6] uppercase tracking-widest">Asset Categories</p>
                <h3 className="text-4xl font-extrabold tracking-tight mt-2 text-foreground">
                  {stats.counts.categories}
                </h3>
              </div>
              <div className="p-3 bg-[#8B5CF6]/10 rounded-2xl text-[#8B5CF6]">
                <Tag className="h-6 w-6" />
              </div>
            </div>
            
            <div className="mt-4">
              <Link 
                href="/categories" 
                className="text-xs font-bold text-[#8B5CF6] hover:underline inline-flex items-center gap-1 group"
              >
                Category Matrix
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Card 4: Unread Alerts */}
          <div className="premium-card p-6 flex flex-col justify-between min-h-[190px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Unresolved Alerts</p>
                <h3 className="text-4xl font-extrabold tracking-tight mt-2 text-foreground">
                  {stats.counts.unreadNotifications}
                </h3>
              </div>
              <div className={`p-3 rounded-2xl ${stats.counts.unreadNotifications > 0 ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                <Bell className="h-6 w-6" />
              </div>
            </div>
            
            <div className="mt-4">
              <Link 
                href="/notifications" 
                className="text-xs font-bold text-foreground hover:underline inline-flex items-center gap-1 group"
              >
                Alert Dashboard
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Card 5: Quick Actions Panel */}
          <div className="premium-card p-6 bg-slate-900 text-white dark:bg-white/5 dark:text-foreground flex flex-col justify-between min-h-[190px]">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-[#007AFF] uppercase tracking-widest">Quick actions</p>
              <h4 className="text-md font-extrabold tracking-tight mt-2">Manage Resources</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Link href="/assets" className="p-2 bg-white/10 dark:bg-white/5 hover:bg-white/15 rounded-xl text-center text-[10px] font-bold transition-all">
                Register Asset
              </Link>
              <Link href="/bookings" className="p-2 bg-white/10 dark:bg-white/5 hover:bg-white/15 rounded-xl text-center text-[10px] font-bold transition-all">
                Book Room
              </Link>
            </div>
          </div>

        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Chart 1: Employees by Department (Apple Stocks Style bar UI) */}
          <div className="lg:col-span-2 premium-card p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-base font-extrabold tracking-tight">Staff Distribution</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Departmental workforce sizing</p>
              </div>
            </div>

            {stats.employeesByDepartment.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                No active departments.
              </div>
            ) : (
              <div className="space-y-5 py-2">
                {stats.employeesByDepartment.map((d) => {
                  const percent = (d.count / maxDeptEmployees) * 100;
                  return (
                    <div key={d.department} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{d.department}</span>
                        <span className="text-[#007AFF] font-bold">{d.count} Staff</span>
                      </div>
                      <div className="h-6 w-full bg-slate-100/50 dark:bg-white/5 rounded-full overflow-hidden relative">
                        <div 
                          className="h-full bg-gradient-to-r from-[#007AFF] to-[#8B5CF6] rounded-full transition-all duration-500 shadow-sm" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chart 2: Users by Role (Vision-Pro Donut Ring) */}
          <div className="premium-card p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Role Allocation</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Permissions breakdown</p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center my-6">
              {stats.usersByRole.length === 0 ? (
                <p className="text-slate-450 text-xs">No active users.</p>
              ) : (
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                    <circle 
                      cx="70" cy="70" r={donutRadius} 
                      className="text-slate-100 dark:text-zinc-800" 
                      strokeWidth="11" 
                      fill="transparent" 
                      stroke="currentColor"
                    />
                    {stats.usersByRole.map((r, idx) => {
                      const percent = r.count / totalUsers;
                      const strokeLength = percent * donutCircumference;
                      const strokeOffset = donutCircumference - accumulatedPercentage;
                      accumulatedPercentage += strokeLength;
                      const color = roleColors[r.role] || "#64748b";

                      return (
                        <circle
                          key={r.role}
                          cx="70"
                          cy="70"
                          r={donutRadius}
                          stroke={color}
                          strokeWidth="11"
                          strokeDasharray={donutCircumference}
                          strokeDashoffset={strokeOffset}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-300"
                        />
                      );
                    })}
                  </svg>
                  
                  {/* Central Text readout */}
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold tracking-tight">{totalUsers}</span>
                    <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">Accounts</span>
                  </div>
                </div>
              )}
            </div>

            {/* Legends layout */}
            <div className="space-y-2 border-t border-slate-100/50 dark:border-white/5 pt-4">
              {stats.usersByRole.map((r) => {
                const color = roleColors[r.role] || "#64748b";
                return (
                  <div key={r.role} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[9px] tracking-wider">
                        {r.role.replace("_", " ")}
                      </span>
                    </div>
                    <span className="font-extrabold">{r.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* System Activity & Logins logs */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Vertical Activities timeline */}
          <div className="lg:col-span-2 premium-card p-6">
            <h3 className="text-base font-extrabold tracking-tight mb-6 flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-slate-400" />
              Event Chronology
            </h3>

            {stats.recentActivity.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
                No system activity logged.
              </div>
            ) : (
              <div className="space-y-1 pl-1">
                {stats.recentActivity.map((log) => (
                  <div key={log.id} className="timeline-item">
                    <span className="timeline-dot" />
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {log.user?.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                          {log.description}
                        </p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[8px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">
                          {log.module}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sleek Logins list */}
          <div className="premium-card p-6">
            <h3 className="text-base font-extrabold tracking-tight mb-6 flex items-center gap-2">
              <LogIn className="h-4.5 w-4.5 text-slate-400" />
              Active Sessions
            </h3>

            {stats.latestLogins.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
                No recent logins recorded.
              </div>
            ) : (
              <div className="space-y-4">
                {stats.latestLogins.map((login) => (
                  <div key={login.id} className="flex justify-between items-center pb-3 border-b border-slate-100/50 dark:border-white/5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {login.user?.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold">{login.user?.name}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{login.user?.email}</p>
                      </div>
                    </div>
                    
                    <span className="text-[9px] font-extrabold text-slate-450 dark:text-slate-500 bg-slate-100/60 dark:bg-white/5 py-1 px-2.5 rounded-full border border-slate-200/10">
                      {new Date(login.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </Layout>
  );
}
