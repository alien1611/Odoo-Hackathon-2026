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
  TrendingUp
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
        <div className="space-y-6">
          {/* Card Grid Skeleton */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white border border-slate-200 rounded-lg p-5">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-20 bg-slate-200 rounded"></div>
                  <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                </div>
                <div className="h-8 w-16 bg-slate-300 rounded mt-4"></div>
              </div>
            ))}
          </div>
          {/* Chart/Log Grid Skeleton */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-pulse">
            <div className="lg:col-span-2 h-96 bg-white border border-slate-200 rounded-lg p-5"></div>
            <div className="h-96 bg-white border border-slate-200 rounded-lg p-5"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !stats) {
    return (
      <Layout>
        <div className="p-8 text-center bg-white border border-slate-200 rounded-lg max-w-md mx-auto mt-10">
          <p className="text-red-600 font-semibold mb-2">Error</p>
          <p className="text-slate-500 text-sm mb-4">{error || "An error occurred"}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  // Calculate percentages for Roles Pie Chart mock representation
  const totalUsers = stats.usersByRole.reduce((sum, r) => sum + r.count, 0) || 1;
  const roleColors: Record<string, string> = {
    ADMIN: "#0f172a",
    EMPLOYEE: "#3b82f6",
    ASSET_MANAGER: "#10b981",
    DEPARTMENT_HEAD: "#f59e0b",
  };

  // Find max employees count for relative bar charts
  const maxDeptEmployees = Math.max(...stats.employeesByDepartment.map(d => d.count), 1);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Employees */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Employees</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.counts.employees}</h3>
              </div>
              <div className="p-3 bg-slate-100 rounded-lg text-slate-700">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-semibold text-emerald-600">Active</span> in organization directory
            </div>
          </div>

          {/* Card 2: Departments */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Departments</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.counts.departments}</h3>
              </div>
              <div className="p-3 bg-slate-100 rounded-lg text-slate-700">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
              <Link href="/departments" className="text-slate-900 hover:underline flex items-center gap-1 font-medium">
                Manage departments <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card 3: Asset Categories */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Asset Categories</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.counts.categories}</h3>
              </div>
              <div className="p-3 bg-slate-100 rounded-lg text-slate-700">
                <Tag className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
              <Link href="/categories" className="text-slate-900 hover:underline flex items-center gap-1 font-medium">
                View asset categories <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card 4: Unread Notifications */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Unread Alerts</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.counts.unreadNotifications}</h3>
              </div>
              <div className={`p-3 rounded-lg ${stats.counts.unreadNotifications > 0 ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-700"}`}>
                <Bell className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
              <Link href="/notifications" className="text-slate-900 hover:underline flex items-center gap-1 font-medium">
                View notification inbox <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Charts & Distribution Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Chart 1: Employees by Department (Relative Bar Chart) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-6">Employees by Department</h3>
            {stats.employeesByDepartment.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                No departments registered
              </div>
            ) : (
              <div className="space-y-4">
                {stats.employeesByDepartment.map((d) => {
                  const percent = (d.count / maxDeptEmployees) * 100;
                  return (
                    <div key={d.department} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-slate-700">{d.department}</span>
                        <span className="text-slate-500 font-medium">{d.count} Employees</span>
                      </div>
                      <div className="h-7 w-full bg-slate-100 rounded-md overflow-hidden relative">
                        <div 
                          className="h-full bg-slate-900 rounded-md transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chart 2: Users by Role (Radial Grid / List) */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col">
            <h3 className="text-base font-bold text-slate-900 mb-6">Users by Role</h3>
            <div className="flex-1 flex flex-col justify-center">
              {stats.usersByRole.length === 0 ? (
                <p className="text-center text-slate-400 text-sm">No user roles recorded</p>
              ) : (
                <div className="space-y-5">
                  {stats.usersByRole.map((r) => {
                    const percent = Math.round((r.count / totalUsers) * 100);
                    const color = roleColors[r.role] || "#64748b";
                    return (
                      <div key={r.role} className="flex items-center gap-4">
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <div className="flex-1 flex justify-between items-center">
                          <div>
                            <span className="text-sm font-bold text-slate-700 uppercase tracking-wide block">
                              {r.role.replace("_", " ")}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">{r.count} users</span>
                          </div>
                          <span className="text-sm font-bold text-slate-800 bg-slate-100 py-1 px-2.5 rounded-full">
                            {percent}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity logs & Logins lists */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Activity Log */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-400" />
                Recent System Activity
              </h3>
            </div>
            {stats.recentActivity.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                No system activity logged
              </div>
            ) : (
              <div className="flow-root">
                <ul className="-mb-8">
                  {stats.recentActivity.map((log, index) => (
                    <li key={log.id}>
                      <div className="relative pb-8">
                        {index !== stats.recentActivity.length - 1 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white ring-8 ring-white">
                              {log.user?.name[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-slate-600 font-medium">
                                <span className="font-bold text-slate-950">{log.user?.name}</span>{" "}
                                {log.description}
                              </p>
                            </div>
                            <div className="text-right text-xs whitespace-nowrap text-slate-400 font-semibold">
                              {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Latest Logins */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
              <LogIn className="h-5 w-5 text-slate-400" />
              Latest Logins
            </h3>
            {stats.latestLogins.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                No recent logins recorded
              </div>
            ) : (
              <div className="space-y-4">
                {stats.latestLogins.map((login) => (
                  <div key={login.id} className="flex justify-between items-start border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{login.user?.name}</p>
                      <p className="text-xs text-slate-400">{login.user?.email}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-50 py-1 px-2.5 rounded border border-slate-200">
                      {new Date(login.createdAt).toLocaleDateString()}
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
