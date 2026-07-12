// client/components/Layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Building2, 
  Tag, 
  Users, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X,
  Shield,
  Activity,
  Calendar,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Package
} from "lucide-react";
import { api } from "@/lib/axios";

interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserPayload | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
    } else {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications/user");
        if (response.data.success) {
          const unread = response.data.data.filter((n: any) => !n.read).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Assets", href: "/assets", icon: Package },
    { name: "Bookings", href: "/bookings", icon: Calendar },
    { name: "Maintenance", href: "/maintenance", icon: Wrench },
    { name: "Audits", href: "/audits", icon: ClipboardCheck },
    { name: "Reports & Analytics", href: "/reports", icon: BarChart3 },
    { name: "Departments", href: "/departments", icon: Building2 },
    { name: "Categories", href: "/categories", icon: Tag },
    { name: "Employees", href: "/employees", icon: Users },
    { name: "Notifications", href: "/notifications", icon: Bell, badge: unreadCount },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const getPageTitle = () => {
    const activeItem = menuItems.find(item => pathname.startsWith(item.href));
    return activeItem ? activeItem.name : "ERP System";
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Header / Navbar */}
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-500 rounded-md hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-xl font-bold text-slate-900 hidden sm:inline-block">
            Enterprise ERP
          </span>
          <span className="h-4 w-px bg-slate-200 hidden sm:inline-block"></span>
          <h2 className="text-lg font-semibold text-slate-700">
            {getPageTitle()}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <Link 
            href="/notifications" 
            className="relative p-2 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 focus:outline-none transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                {user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <span className="text-sm font-medium text-slate-700 hidden md:inline-block">
                {user.name}
              </span>
            </button>

            {isProfileDropdownOpen && (
              <>
                <div 
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="fixed inset-0 z-40"
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md border border-slate-200 shadow-lg z-50 py-1">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <Shield className="h-3 w-3 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <Link 
                    href="/profile" 
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    My Profile
                  </Link>
                  <button 
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-slate-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex relative">
        {/* Sidebar for Desktop */}
        <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col shrink-0">
          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? "bg-slate-900 text-white" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isActive ? "bg-white text-slate-950" : "bg-red-100 text-red-700"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-150">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-1">
              <Activity className="h-3.5 w-3.5" />
              <span>System Status</span>
            </div>
            <p className="text-[11px] text-emerald-600 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              All services operational
            </p>
          </div>
        </aside>

        {/* Sidebar Backdrop for Mobile */}
        {isSidebarOpen && (
          <>
            <div 
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <aside className="fixed top-0 bottom-0 left-0 w-64 bg-white z-50 flex flex-col lg:hidden border-r border-slate-200">
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
                <span className="text-xl font-bold text-slate-900">ERP System</span>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 text-slate-500 rounded-md hover:bg-slate-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive 
                          ? "bg-slate-900 text-white" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isActive ? "bg-white text-slate-950" : "bg-red-100 text-red-700"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </>
        )}

        {/* Content Panel */}
        <main className="flex-1 overflow-x-hidden p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
