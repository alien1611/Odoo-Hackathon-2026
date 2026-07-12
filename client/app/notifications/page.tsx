// client/app/notifications/page.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { 
  Bell, 
  Check, 
  Trash2, 
  BellRing,
  MailOpen,
  Mail,
  Loader2,
  Calendar
} from "lucide-react";

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/notifications/user");
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (err) {
      setError("Failed to load notifications.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await api.patch(`/notifications/read/${id}`);
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;

    try {
      await Promise.all(unread.map(n => api.patch(`/notifications/read/${n.id}`)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await api.delete(`/notifications/user/${id}`);
      if (response.data.success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const getNotificationPill = (type: string) => {
    switch (type.toUpperCase()) {
      case "SYSTEM":
        return "bg-slate-100 text-slate-500 border-slate-205/50";
      case "ALERT":
      case "CRITICAL":
        return "status-pill-lost";
      case "INFO":
      default:
        return "status-pill-allocated";
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl mx-auto animate-page-enter">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <BellRing className="h-6 w-6 text-slate-400" />
              Notifications
            </h1>
            <p className="text-xs text-slate-450 dark:text-slate-450 mt-1">Review alerts, audit verifications, and system actions.</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="apple-btn apple-btn-secondary py-2 px-4 text-xs font-bold"
            >
              <Check className="h-4 w-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Content list */}
        {isLoading ? (
          <div className="p-16 text-center text-slate-450">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
            Refreshing inbox...
          </div>
        ) : error ? (
          <div className="p-16 text-center text-red-650 bg-red-500/5 rounded-3xl border border-red-500/10">
            <p className="font-extrabold text-sm">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center bg-white dark:bg-[#15181D] rounded-3xl border border-slate-250/20 dark:border-white/5">
            <Bell className="h-12 w-12 text-slate-350 dark:text-zinc-700 mb-3" />
            <p className="text-sm font-extrabold text-slate-500">Inbox is empty</p>
            <p className="text-xs text-slate-450 mt-1 max-w-[280px]">You have no active system notifications at this time.</p>
          </div>
        ) : (
          <div className="luxury-table-container divide-y divide-slate-250/20 dark:divide-white/5">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-6 flex items-start gap-4 hover:bg-slate-50/50 dark:hover:bg-white/1 transition-all duration-200 ${
                  !n.read ? "bg-slate-50/30 dark:bg-white/1" : ""
                }`}
              >
                {/* Icon wrapper based on status */}
                <div className={`p-2.5 rounded-xl border ${getNotificationPill(n.type)} shrink-0`}>
                  {!n.read ? <Mail className="h-4.5 w-4.5 animate-pulse" /> : <MailOpen className="h-4.5 w-4.5" />}
                </div>

                {/* Text content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm ${!n.read ? "font-extrabold text-foreground" : "font-semibold text-slate-650 dark:text-slate-400"}`}>
                      {n.title}
                    </h4>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-[#007AFF] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-semibold">{n.message}</p>
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mt-4">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(n.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 self-center">
                  {!n.read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="p-2 text-slate-400 hover:text-foreground rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-2 text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                    title="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
