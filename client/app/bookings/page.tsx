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
  AlertCircle
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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
      const response = await api.get("/bookings?limit=100"); // Load enough for calendar/list
      if (response.data.success) {
        setBookings(response.data.data.bookings);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load bookings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchBookings();
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
      setModalError(err.response?.data?.message || "Failed to submit booking. Overlap conflict detected.");
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

  // Simple Month calendar logic
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
            onClick={() => setIsAddModalOpen(true)}
            className="apple-btn apple-btn-primary"
          >
            <Plus className="h-4 w-4" />
            New Booking
          </button>
        </div>

        {/* View Toggle / Navigation bar */}
        <div className="glass-panel p-4 bg-white/50 dark:bg-[#15181D]/45 flex justify-between items-center">
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
                    <p className="text-xs text-slate-400 mt-1 max-w-[280px]">Be the first to request a room reservation.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-250/20 dark:divide-white/5">
                    {bookings.map((booking) => {
                      const startStr = new Date(booking.startTime).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
                      const endStr = new Date(booking.endTime).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
                      const isOwner = currentUser?.id === booking.bookedBy;
                      const isApprover = ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"].includes(currentUser?.role || "");

                      return (
                        <div key={booking.id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-white/1 transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2.5">
                              <span className={`status-pill ${getStatusPillClass(booking.status)}`}>
                                {booking.status}
                              </span>
                              <span className="text-sm font-extrabold text-foreground">{booking.resourceType}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{booking.purpose}</p>
                            <div className="flex flex-wrap gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {startStr} - {endStr}</span>
                              <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> By: {booking.user?.name || "Unknown"}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
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
                    if (!day) return <div key={`empty-${idx}`} className="bg-white/40 dark:bg-[#15181D]/20 min-h-[90px] p-2 rounded-xl" />;
                    
                    const dayBookings = getBookingsForDay(day);
                    const isToday = day.toISOString().split("T")[0] === today;

                    return (
                      <div 
                        key={day.toISOString()} 
                        className={`bg-white dark:bg-[#15181D] min-h-[95px] p-2 rounded-xl border border-slate-250/15 dark:border-white/5 flex flex-col justify-between hover:bg-slate-50 dark:hover:bg-white/1 transition-all duration-200 ${
                          isToday ? "ring-2 ring-[#007AFF] ring-inset" : ""
                        }`}
                      >
                        <span className={`text-[10px] font-extrabold ${isToday ? "text-[#007AFF]" : "text-slate-450"}`}>{day.getDate()}</span>
                        
                        <div className="space-y-1 mt-2 flex-1 flex flex-col justify-end">
                          {dayBookings.slice(0, 2).map((b) => (
                            <div 
                              key={b.id} 
                              className={`text-[8px] font-bold p-1 rounded-lg border overflow-hidden truncate ${
                                b.status === "APPROVED" 
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" 
                                  : "bg-amber-500/10 text-amber-500 border-amber-500/10"
                              }`}
                              title={`${b.resourceType}: ${b.purpose}`}
                            >
                              {b.resourceType.split(" ")[0]}: {b.purpose}
                            </div>
                          ))}
                          {dayBookings.length > 2 && (
                            <div className="text-[8px] font-extrabold text-slate-450 text-center mt-0.5">
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
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/40 backdrop-blur-md animate-page-enter">
            <div className="bg-white dark:bg-[#15181D] border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-2xl w-full max-w-md p-6 relative">
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
                <div className="p-3 mb-4 text-xs text-red-650 bg-red-500/10 border border-red-500/15 rounded-2xl font-bold flex items-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleCreateBooking} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Resource Type</label>
                  <select 
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value)}
                    className="glass-input bg-white/95 dark:bg-[#15181D]/95"
                  >
                    <option value="Meeting Room">Meeting Room</option>
                    <option value="Conference Hall">Conference Hall</option>
                    <option value="Projector">Projector</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Shared Device">Shared Device</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Resource ID (UUID)</label>
                  <input 
                    type="text" required placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                    value={resourceId}
                    onChange={(e) => setResourceId(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Start Date & Time</label>
                  <input 
                    type="datetime-local" required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">End Date & Time</label>
                  <input 
                    type="datetime-local" required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Booking Purpose</label>
                  <textarea 
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="glass-input h-20 resize-none"
                    placeholder="Specify booking description/purpose..."
                  />
                </div>

                <button type="submit" className="w-full apple-btn apple-btn-primary py-3">
                  Request Reservation
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
