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

  const getNotificationColor = (type: string) => {
    switch (type.toUpperCase()) {
      case "SYSTEM":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "ALERT":
      case "CRITICAL":
        return "bg-red-50 text-red-700 border-red-200";
      case "INFO":
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BellRing className="h-6 w-6 text-slate-400" />
              Notifications Inbox
            </h1>
            <p className="text-sm text-slate-500 mt-1">Review alerts, audit notifications, and system warnings</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-250 rounded-md hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
            >
              <Check className="h-4 w-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Content list */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20 bg-white border border-slate-200 rounded-lg">
            <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-white border border-slate-200 rounded-lg py-16 px-4 text-center">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg py-16 px-4 text-center">
            <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-800">Inbox is Empty</h3>
            <p className="text-sm text-slate-500 mt-1">You do not have any notification alerts at this time.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm divide-y divide-slate-100">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors ${
                  !n.read ? "bg-slate-50/50" : ""
                }`}
              >
                {/* Icon wrapper based on status */}
                <div className={`p-2.5 rounded-lg border ${getNotificationColor(n.type)} shrink-0`}>
                  {!n.read ? <Mail className="h-5 w-5 animate-pulse" /> : <MailOpen className="h-5 w-5" />}
                </div>

                {/* Text content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm ${!n.read ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
                      {n.title}
                    </h4>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-blue-650 shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{n.message}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 mt-3">
                    <Calendar className="h-3 w-3" />
                    {new Date(n.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-center">
                  {!n.read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
