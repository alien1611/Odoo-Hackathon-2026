// client/app/bookings/page.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  User, 
  X, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  Building2,
  Tag,
  FileText,
  Sparkles,
  Loader2
} from "lucide-react";

interface Booking {
  id: string;
  resourceId: string;
  resourceType: string;
  bookedBy: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface AssetOption {
  id: string;
  name: string;
  assetTag: string;
  category?: {
    name: string;
  };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableAssets, setAvailableAssets] = useState<AssetOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Current user details
  const [currentUser, setCurrentUser] = useState<any>(null);

  // New Booking Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [resourceId, setResourceId] = useState("");
  const [resourceType, setResourceType] = useState("Meeting Room");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);

  // Calendar View filters
  const [viewMode, setViewMode] = useState<"LIST" | "MONTH">("LIST");
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/bookings?limit=100");
      if (response.data.success) {
        setBookings(response.data.data.bookings);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load bookings.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await api.get("/assets?limit=20");
      if (response.data.success) {
        setAvailableAssets(response.data.data.assets || []);
      }
    } catch (err) {
      console.error("Failed to load assets for booking selection", err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchBookings();
    fetchAssets();
  }, []);

  const generateRandomUuid = () => {
    const uuid = typeof window !== 'undefined' && window.crypto?.randomUUID 
      ? window.crypto.randomUUID() 
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
    setResourceId(uuid);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setModalError(null);
      
      const response = await api.post("/bookings", {
        resourceId,
        resourceType,
        startTime,
        endTime,
        purpose
      });
      
      if (response.data.success) {
        setIsAddModalOpen(false);
        resetFormStates();
        fetchBookings();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || "Failed to submit booking. Overlap conflict or invalid date detected.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await api.patch(`/bookings/${id}`, { status: "APPROVED" });
      if (response.data.success) {
        fetchBookings();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to approve booking.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await api.patch(`/bookings/${id}`, { status: "REJECTED" });
      if (response.data.success) {
        fetchBookings();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to reject booking.");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const response = await api.delete(`/bookings/${id}`);
      if (response.data.success) {
        fetchBookings();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to cancel booking.");
    }
  };

  const resetFormStates = () => {
    setResourceId("");
    setResourceType("Meeting Room");
    setStartTime("");
    setEndTime("");
    setPurpose("");
    setModalError(null);
  };

  const getStatusPillClass = (status: string) => {
    switch (status) {
      case "APPROVED": return "status-pill-available";
      case "PENDING": return "status-pill-reserved";
      case "REJECTED": return "status-pill-lost";
      case "CANCELLED": return "bg-slate-100 text-slate-500 border-slate-200/50";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Helper date lists
  const today = new Date().toISOString().split("T")[0];
  const todayBookings = bookings.filter(b => b.startTime.startsWith(today));
  const upcomingBookings = bookings.filter(b => new Date(b.startTime) > new Date() && b.status !== "CANCELLED" && b.status !== "REJECTED");

  // Month calendar calculations
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const calendarDays = [];

  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const getBookingsForDay = (date: Date) => {
    const formatted = date.toISOString().split("T")[0];
    return bookings.filter(b => b.startTime.startsWith(formatted));
  };

  return (
    <Layout>
      <div className="space-y-8 animate-page-enter">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Resource Bookings</h1>
            <p className="text-xs text-slate-450 dark:text-slate-450 mt-1">Reserve workspaces, meeting rooms, and corporate hardware.</p>
          </div>
          <button 
            onClick={() => {
              if (!resourceId) generateRandomUuid();
              setIsAddModalOpen(true);
            }}
            className="apple-btn apple-btn-primary"
          >
            <Plus className="h-4 w-4" />
            New Booking
          </button>
        </div>

        {/* View Toggle / Navigation bar */}
        <div className="glass-panel p-4 bg-white/50 dark:bg-[#15181D]/45 flex justify-between items-center flex-wrap gap-3">
          <div className="flex gap-2 bg-slate-100/50 dark:bg-white/5 p-1 rounded-2xl">
            <button 
              onClick={() => setViewMode("LIST")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                viewMode === "LIST" 
                  ? "bg-white dark:bg-[#15181D] text-[#007AFF] shadow-md shadow-black/5" 
                  : "text-slate-500 hover:text-foreground"
              }`}
            >
              List View
            </button>
            <button 
              onClick={() => setViewMode("MONTH")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                viewMode === "MONTH" 
                  ? "bg-white dark:bg-[#15181D] text-[#007AFF] shadow-md shadow-black/5" 
                  : "text-slate-500 hover:text-foreground"
              }`}
            >
              Calendar View
            </button>
          </div>

          {viewMode === "MONTH" && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                className="apple-btn apple-btn-secondary p-2"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-extrabold uppercase tracking-widest text-foreground px-2">
                {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </span>
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                className="apple-btn apple-btn-secondary p-2"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Master Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Booking View */}
          <div className="lg:col-span-2 space-y-6">
            {viewMode === "LIST" ? (
              <div className="luxury-table-container">
                <div className="px-6 py-4 border-b border-slate-200/20 dark:border-white/5 bg-slate-50/50 dark:bg-white/1 flex items-center justify-between">
                  <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-450">All Bookings</h3>
                  <span className="text-xs font-bold text-slate-400">{bookings.length} reservations</span>
                </div>
                
                {isLoading ? (
                  <div className="p-16 text-center text-slate-450">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
                    Refreshing schedules...
                  </div>
                ) : error ? (
                  <div className="p-16 text-center text-red-650 bg-red-500/5 flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                    <p className="font-extrabold text-sm">{error}</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center justify-center">
                    <CalendarIcon className="h-12 w-12 text-slate-350 dark:text-zinc-700 mb-3" />
                    <p className="text-sm font-extrabold text-slate-500">No bookings recorded</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-[280px]">Be the first to request a room or resource reservation.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-250/20 dark:divide-white/5">
                    {bookings.map((booking) => {
                      const startStr = new Date(booking.startTime).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
                      const endStr = new Date(booking.endTime).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
                      const isOwner = currentUser?.id === booking.bookedBy;
                      const isApprover = ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"].includes(currentUser?.role || "");

                      return (
                        <div key={booking.id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-white/1 transition-all duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className={`status-pill ${getStatusPillClass(booking.status)}`}>
                                {booking.status}
                              </span>
                              <span className="text-sm font-extrabold text-foreground">{booking.resourceType}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium break-words leading-relaxed">{booking.purpose}</p>
                            <div className="flex flex-wrap gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" /> {startStr} - {endStr}</span>
                              <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-slate-400" /> By: {booking.user?.name || "Unknown"}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                            {booking.status === "PENDING" && isApprover && (
                              <>
                                <button 
                                  onClick={() => handleApprove(booking.id)}
                                  className="apple-btn apple-btn-primary py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10 text-xs font-bold"
                                >
                                  <Check className="h-3.5 w-3.5" /> Approve
                                </button>
                                <button 
                                  onClick={() => handleReject(booking.id)}
                                  className="apple-btn apple-btn-secondary py-1.5 px-3 text-red-500 border-red-500/10 hover:bg-red-500/5 text-xs font-bold"
                                >
                                  <X className="h-3.5 w-3.5" /> Reject
                                </button>
                              </>
                            )}
                            {booking.status === "PENDING" && (isOwner || isApprover) && (
                              <button 
                                onClick={() => handleCancel(booking.id)}
                                className="apple-btn apple-btn-secondary py-1.5 px-3 text-red-500 border-red-500/10 hover:bg-red-500/5 text-xs font-bold"
                              >
                                <X className="h-3.5 w-3.5" /> Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              // Month Calendar View Grid
              <div className="glass-panel p-4 bg-white/50 dark:bg-[#15181D]/45">
                <div className="grid grid-cols-7 gap-1 text-center font-extrabold text-[9px] text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-3">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>

                <div className="grid grid-cols-7 gap-1.5 bg-slate-200/40 dark:bg-black/20 p-1.5 rounded-2xl border border-slate-200/10">
                  {calendarDays.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} className="bg-white/40 dark:bg-[#15181D]/20 min-h-[105px] p-2 rounded-xl" />;
                    
                    const dayBookings = getBookingsForDay(day);
                    const isToday = day.toISOString().split("T")[0] === today;

                    return (
                      <div 
                        key={day.toISOString()} 
                        className={`bg-white dark:bg-[#15181D] min-h-[105px] h-full p-2 rounded-xl border border-slate-250/15 dark:border-white/5 flex flex-col justify-between hover:bg-slate-50 dark:hover:bg-white/1 transition-all duration-200 overflow-hidden ${
                          isToday ? "ring-2 ring-[#007AFF] ring-inset" : ""
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${isToday ? "bg-[#007AFF] text-white" : "text-slate-500"}`}>{day.getDate()}</span>
                          {dayBookings.length > 0 && (
                            <span className="text-[8px] font-bold text-slate-400">{dayBookings.length} {dayBookings.length === 1 ? 'evt' : 'evts'}</span>
                          )}
                        </div>
                        
                        <div className="space-y-1 flex-1 flex flex-col justify-end overflow-hidden">
                          {dayBookings.slice(0, 2).map((b) => (
                            <div 
                              key={b.id} 
                              className={`text-[9px] font-semibold p-1 rounded-md border truncate leading-tight ${
                                b.status === "APPROVED" 
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/15" 
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/15"
                              }`}
                              title={`${b.resourceType}: ${b.purpose}`}
                            >
                              {b.resourceType}: {b.purpose}
                            </div>
                          ))}
                          {dayBookings.length > 2 && (
                            <div className="text-[8px] font-extrabold text-slate-400 text-center">
                              +{dayBookings.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Schedule Sidebar */}
          <div className="space-y-6">
            
            {/* Today's Schedule panel */}
            <div className="premium-card p-5 space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-450 flex items-center gap-2 pb-2 border-b border-slate-250/20 dark:border-white/5">
                <Clock className="h-4.5 w-4.5 text-slate-400" />
                Today's Bookings
              </h3>
              {todayBookings.length === 0 ? (
                <p className="text-slate-450 text-[10px] font-semibold text-center py-6">No reservations scheduled.</p>
              ) : (
                <div className="space-y-3">
                  {todayBookings.map(b => (
                    <div key={b.id} className="p-3 border border-slate-200/50 dark:border-white/5 rounded-xl bg-slate-50/50 dark:bg-white/1 text-xs space-y-1">
                      <div className="flex justify-between items-center font-bold text-foreground">
                        <span>{b.resourceType}</span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                          b.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                        }`}>{b.status}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-semibold">{b.purpose}</p>
                      <p className="text-slate-400 text-[10px] font-bold">
                        {new Date(b.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(b.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Schedule panel */}
            <div className="premium-card p-5 space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-450 flex items-center gap-2 pb-2 border-b border-slate-250/20 dark:border-white/5">
                <CalendarIcon className="h-4.5 w-4.5 text-slate-400" />
                Upcoming Requests
              </h3>
              {upcomingBookings.length === 0 ? (
                <p className="text-slate-450 text-[10px] font-semibold text-center py-6">No upcoming reservations logged.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.slice(0, 5).map(b => (
                    <div key={b.id} className="p-3 border border-slate-200/50 dark:border-white/5 rounded-xl bg-slate-50/50 dark:bg-white/1 text-xs space-y-1">
                      <div className="flex justify-between items-center font-bold text-foreground">
                        <span>{b.resourceType}</span>
                        <span className="text-slate-400 font-bold text-[9px]">{new Date(b.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-semibold truncate">{b.purpose}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* NEW BOOKING REQUEST MODAL */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md overflow-y-auto animate-page-enter">
            <div className="bg-white dark:bg-[#15181D] border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="window-dot dot-close" />
                    <span className="window-dot dot-minimize" />
                    <span className="window-dot dot-maximize" />
                  </div>
                  <h3 className="text-lg font-extrabold text-foreground">Request Resource Booking</h3>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="p-1 text-slate-400 hover:text-foreground rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 mb-4 text-xs text-red-650 bg-red-500/10 border border-red-500/15 rounded-2xl font-bold flex items-start gap-2">
                  <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleCreateBooking} className="space-y-5">
                
                {/* Resource Type */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-0.5">
                    Resource Type
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10 text-slate-400 dark:text-slate-500">
                      <Building2 className="h-4.5 w-4.5" />
                    </span>
                    <select 
                      value={resourceType}
                      onChange={(e) => setResourceType(e.target.value)}
                      className="glass-input glass-input-icon !pl-11 pr-4 bg-white/95 dark:bg-[#15181D]/95"
                    >
                      <option value="Meeting Room">Meeting Room</option>
                      <option value="Conference Hall">Conference Hall</option>
                      <option value="Projector">Projector</option>
                      <option value="Vehicle">Vehicle</option>
                      <option value="Shared Device">Shared Device</option>
                    </select>
                  </div>
                </div>

                {/* Resource ID UUID */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-0.5">
                      Resource ID (UUID)
                    </label>
                    <button 
                      type="button" 
                      onClick={generateRandomUuid} 
                      className="text-[10px] text-[#007AFF] hover:underline font-bold"
                    >
                      Auto-Generate UUID
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10 text-slate-400 dark:text-slate-500">
                      <Tag className="h-4.5 w-4.5" />
                    </span>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. b8449c2a-b620-410a-85d7-1306de15c7ea"
                      value={resourceId}
                      onChange={(e) => setResourceId(e.target.value)}
                      className="glass-input glass-input-icon !pl-11 pr-4 font-mono text-xs"
                    />
                  </div>
                  {availableAssets.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1 overflow-x-auto py-1">
                      <span className="text-[9px] text-slate-400 font-bold shrink-0">Quick Select:</span>
                      {availableAssets.slice(0, 3).map(asset => (
                        <button
                          key={asset.id}
                          type="button"
                          onClick={() => {
                            setResourceId(asset.id);
                            setResourceType(asset.category?.name || "Shared Device");
                          }}
                          className="text-[9px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-[#007AFF]/10 hover:text-[#007AFF] transition-colors truncate max-w-[140px]"
                          title={`${asset.name} (${asset.assetTag})`}
                        >
                          {asset.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date/Time pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-0.5">
                      Start Date & Time
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10 text-slate-400 dark:text-slate-500">
                        <CalendarIcon className="h-4.5 w-4.5" />
                      </span>
                      <input 
                        type="datetime-local" 
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="glass-input glass-input-icon !pl-11 pr-3 w-full text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-0.5">
                      End Date & Time
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10 text-slate-400 dark:text-slate-500">
                        <Clock className="h-4.5 w-4.5" />
                      </span>
                      <input 
                        type="datetime-local" 
                        required
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="glass-input glass-input-icon !pl-11 pr-3 w-full text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Purpose */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-0.5">
                    Booking Purpose
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 flex items-center pointer-events-none z-10 text-slate-400 dark:text-slate-500">
                      <FileText className="h-4.5 w-4.5" />
                    </span>
                    <textarea 
                      required
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="glass-input glass-input-icon !pl-11 pt-2.5 h-24 resize-none w-full text-xs"
                      placeholder="Specify booking description, meeting agenda, or resource purpose..."
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="apple-btn apple-btn-secondary px-4 py-2.5"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="apple-btn apple-btn-primary px-6 py-2.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      "Request Reservation"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
