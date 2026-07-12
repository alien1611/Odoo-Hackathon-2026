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
  Calendar,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Package,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Home
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Sync theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
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

  // Auth context verification
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
        const response = await api.get("/notifications");
        if (response.data.success) {
          const unread = response.data.data.notifications.filter((n: any) => !n.read).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Poll every 20s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0D10]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF]"></div>
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
    const activeItem = menuItems.find(item => pathname === item.href || pathname.startsWith(item.href + "/"));
    return activeItem ? activeItem.name : "System Management";
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-450 relative font-sans overflow-hidden">
      
      {/* Background ambient light blobs */}
      <div className="apple-glow apple-glow-blue" />
      <div className="apple-glow apple-glow-purple" />
      <div className="apple-glow apple-glow-cyan" />

      {/* SIDEBAR FOR DESKTOP */}
      <aside 
        className={`hidden lg:flex flex-col shrink-0 transition-all duration-300 z-20 ${
          isSidebarCollapsed ? "w-20" : "w-66"
        } m-6 mr-0 p-5 glass-panel bg-white/40 dark:bg-[#15181D]/45`}
      >
        {/* macOS window dots */}
        <div className="flex items-center justify-between pb-6 mb-2 border-b border-slate-200/25 dark:border-white/5">
          <div className="flex items-center">
            <span className="window-dot dot-close" />
            <span className="window-dot dot-minimize" />
            <span className="window-dot dot-maximize" />
          </div>
          {!isSidebarCollapsed && (
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#007AFF]">
              AssetFlow
            </span>
          )}
        </div>

        {/* Logo and Brand Title */}
        <div className="flex items-center gap-3 py-3 px-1.5 overflow-hidden">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#8B5CF6] flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight">Enterprise ERP</span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Workspace v2</span>
            </div>
          )}
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto pr-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between px-4 py-3 text-xs font-bold rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? "bg-[#007AFF] text-white shadow-lg shadow-blue-500/20" 
                    : "text-[#64748B] dark:text-[#94A3B8] hover:bg-white/60 dark:hover:bg-white/5 hover:text-foreground active:scale-98"
                }`}
                title={isSidebarCollapsed ? item.name : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                  {!isSidebarCollapsed && <span>{item.name}</span>}
                </div>
                {!isSidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide ${
                    isActive ? "bg-white text-[#007AFF]" : "bg-red-500 text-white animate-pulse"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-200/25 dark:border-white/5 flex flex-col gap-4">
          {!isSidebarCollapsed && (
            <div className="flex flex-col gap-1 px-1">
              <span className="text-[9px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest">System Status</span>
              <p className="text-[10px] text-emerald-500 flex items-center gap-2 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                API Connected
              </p>
            </div>
          )}

          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center p-2.5 rounded-xl bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-550 hover:text-foreground transition-all duration-200"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        
        {/* TOP BAR */}
        <header className="m-6 mb-2 p-3 sm:px-6 glass-panel bg-white/40 dark:bg-[#15181D]/45 flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-550 rounded-xl hover:bg-slate-100/60 dark:hover:bg-white/5 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2.5">
              <Home className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs text-slate-350 dark:text-slate-600">/</span>
              <span className="text-xs font-semibold text-slate-450 dark:text-slate-500">AssetFlow</span>
              <span className="text-xs text-slate-350 dark:text-slate-600">/</span>
              <h2 className="text-xs font-bold text-foreground">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Minimalist Search Bar */}
            <div className="relative hidden md:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Type to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-52 px-3 py-1.5 pl-9 text-xs rounded-xl bg-slate-150/40 dark:bg-black/35 border border-slate-200/20 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 focus:bg-white dark:focus:bg-zinc-900 transition-all duration-200 text-foreground placeholder-slate-450"
              />
            </div>

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-450 hover:text-foreground rounded-full hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all duration-200 active:scale-95"
              title="Toggle Theme"
            >
              {theme === "light" ? (
                <Moon className="h-4.5 w-4.5" />
              ) : (
                <Sun className="h-4.5 w-4.5" />
              )}
            </button>

            {/* Notification Bell */}
            <Link 
              href="/notifications" 
              className="relative p-2 text-slate-450 hover:text-foreground rounded-full hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all duration-200"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-extrabold text-white shadow-md shadow-red-500/25 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 px-2.5 rounded-full hover:bg-slate-100/50 dark:hover:bg-white/5 border border-transparent hover:border-slate-200/30 dark:hover:border-white/5 transition-all duration-200"
              >
                <div className="h-7 w-7 rounded-full bg-[#007AFF] text-white flex items-center justify-center font-extrabold text-xs shadow-md shadow-blue-500/20">
                  {user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <span className="text-xs font-bold text-foreground hidden sm:inline-block pr-1">
                  {user.name}
                </span>
              </button>

              {isProfileDropdownOpen && (
                <>
                  <div 
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="fixed inset-0 z-40"
                  />
                  <div className="absolute right-0 mt-3 w-60 bg-white/95 dark:bg-[#15181D]/95 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-2xl z-50 py-1.5 overflow-hidden animate-page-enter">
                    <div className="px-4 py-3.5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/1">
                      <p className="text-xs font-extrabold text-foreground">{user.name}</p>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 truncate mt-0.5">{user.email}</p>
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <Shield className="h-3 w-3 text-[#007AFF]" />
                        <span className="text-[8px] font-extrabold text-[#007AFF] uppercase tracking-widest">
                          {user.role.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    <Link 
                      href="/profile" 
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-xs text-foreground/80 hover:bg-slate-50 dark:hover:bg-white/5 font-semibold transition-colors"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      My Profile
                    </Link>
                    <button 
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-xs text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 border-t border-slate-100 dark:border-white/5 font-extrabold transition-colors"
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

        {/* MOBILE SIDEBAR PANEL */}
        {isSidebarOpen && (
          <>
            <div 
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <aside className="fixed top-0 bottom-0 left-0 w-64 bg-white/95 dark:bg-[#15181D]/95 backdrop-blur-xl z-50 flex flex-col lg:hidden border-r border-slate-200/50 dark:border-white/5 p-5 animate-page-enter">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
                <span className="text-md font-extrabold tracking-tight">AssetFlow</span>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 text-slate-550 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5"
                  aria-label="Close sidebar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 py-6 space-y-1.5 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 text-xs font-bold rounded-2xl transition-all duration-200 ${
                        isActive 
                          ? "bg-[#007AFF] text-white shadow-md shadow-blue-500/10" 
                          : "text-slate-650 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-white/5 hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4.5 w-4.5 ${isActive ? "" : "text-slate-400"}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                          isActive ? "bg-white text-[#007AFF]" : "bg-red-500 text-white"
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

        {/* CONTENT PANEL */}
        <main className="flex-1 p-6 overflow-y-auto min-h-0 w-full relative z-10 animate-page-enter">
          {children}
        </main>
      </div>

    </div>
  );
}
