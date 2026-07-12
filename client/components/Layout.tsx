// client/components/Layout.tsx
"use client";

import { useEffect, useState, useRef } from "react";
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
  Package,
  Sun,
  Moon
} from "lucide-react";
import { api } from "@/lib/axios";

interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserPayload | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Theme Toggle Hook
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

  // 2. Auth context verification
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
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // 3. Cursor Wave Effect Canvas logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      // Create subtle light bubbles around mouse position
      const color = theme === "light" 
        ? `rgba(59, 130, 246, ${0.1 + Math.random() * 0.15})` // soft blue
        : `rgba(14, 165, 233, ${0.12 + Math.random() * 0.18})`; // sky glow

      for (let i = 0; i < 2; i++) {
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -Math.random() * 1.8 - 0.4, // float upwards
          size: Math.random() * 22 + 8,
          color,
          alpha: 1
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        // Glass bubble radial gradient
        const grad = ctx.createRadialGradient(p.x - p.size/3, p.y - p.size/3, p.size/10, p.x, p.y, p.size);
        grad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
        grad.addColorStop(0.5, p.color);
        grad.addColorStop(1, "rgba(255, 255, 255, 0.02)");
        
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.stroke();
        ctx.restore();

        // Update properties
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.015; // Slow fadeout
        p.size += 0.2; // Expand slightly
      }

      particles = particles.filter(p => p.alpha > 0);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-500 relative">
      {/* Background canvas for glass wave effect */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-40 opacity-70"
      />

      {/* Floating Animated Backdrop blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="float-bubble w-96 h-96 bg-blue-400/20 top-20 left-10" />
        <div className="float-bubble w-[450px] h-[450px] bg-purple-400/25 top-1/3 right-10" style={{ animationDelay: "-3s" }} />
        <div className="float-bubble w-80 h-80 bg-emerald-400/20 bottom-20 left-1/4" style={{ animationDelay: "-6s" }} />
      </div>

      {/* Glass Top Header */}
      <header className="sticky top-0 z-30 h-16 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-500 rounded-md hover:bg-slate-100/50 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-xl font-bold text-slate-900 dark:text-white hidden sm:inline-block">
            Enterprise ERP
          </span>
          <span className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:inline-block"></span>
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            {getPageTitle()}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-full hover:bg-slate-100/50 transition-all active:scale-95"
            title="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 rotate-0 transition-transform dark:rotate-90" />
            ) : (
              <Sun className="h-5 w-5 transition-transform" />
            )}
          </button>

          {/* Notification Bell */}
          <Link 
            href="/notifications" 
            className="relative p-2 text-slate-500 rounded-full hover:bg-slate-100/50 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100/50 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-slate-900 dark:bg-white dark:text-slate-950 text-white flex items-center justify-center font-bold text-xs">
                {user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 hidden md:inline-block">
                {user.name}
              </span>
            </button>

            {isProfileDropdownOpen && (
              <>
                <div 
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="fixed inset-0 z-40"
                />
                <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md rounded-md border border-slate-200/50 dark:border-slate-800/50 shadow-lg z-50 py-1">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
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
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-350 hover:bg-slate-100/50"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    My Profile
                  </Link>
                  <button 
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-650 hover:bg-red-50/50 border-t border-slate-100 dark:border-slate-800"
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
      <div className="flex-1 flex relative z-10">
        {/* Sidebar for Desktop */}
        <aside className="w-64 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md border-r border-slate-200/50 dark:border-slate-800/50 hidden lg:flex flex-col shrink-0">
          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                    isActive 
                      ? "bg-slate-900 dark:bg-white dark:text-slate-950 text-white" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4.5 w-4.5 ${isActive ? "" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isActive ? "bg-white text-slate-950 dark:bg-slate-950 dark:text-white" : "bg-red-100 text-red-700"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-1">
              <Activity className="h-3.5 w-3.5" />
              <span>System Status</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-500 flex items-center gap-1.5 font-semibold">
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
            <aside className="fixed top-0 bottom-0 left-0 w-64 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md z-50 flex flex-col lg:hidden border-r border-slate-200/50 dark:border-slate-800/50">
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="text-xl font-bold text-slate-900 dark:text-white">ERP System</span>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 text-slate-500 rounded-md hover:bg-slate-100/50"
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
                      className={`flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                        isActive 
                          ? "bg-slate-900 dark:bg-white dark:text-slate-950 text-white" 
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4.5 w-4.5 ${isActive ? "" : "text-slate-400"}`} />
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
        <main className="flex-1 overflow-x-hidden p-6 max-w-7xl mx-auto w-full relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
