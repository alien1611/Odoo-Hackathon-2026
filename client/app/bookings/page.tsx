// client/app/bookings/page.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  MapPin, 
  User, 
  X, 
  Check, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING": return "bg-amber-50 text-amber-700 border-amber-200";
      case "REJECTED": return "bg-rose-50 text-rose-700 border-rose-200";
      case "CANCELLED": return "bg-slate-50 text-slate-700 border-slate-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
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
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Resource Booking Calendar</h1>
            <p className="text-sm text-slate-500 mt-1">Book shared resources like meeting rooms, conference halls, and projectors.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors text-sm font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Booking
          </button>
        </div>

        {/* View Toggle / Navigation bar */}
        <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode("LIST")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${viewMode === "LIST" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              List View
            </button>
            <button 
              onClick={() => setViewMode("MONTH")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${viewMode === "MONTH" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              Month Calendar
            </button>
          </div>

          {viewMode === "MONTH" && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                className="p-1.5 hover:bg-slate-100 rounded-md border border-slate-250"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </span>
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                className="p-1.5 hover:bg-slate-100 rounded-md border border-slate-250"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          )}
        </div>

        {/* Master Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Booking View */}
          <div className="lg:col-span-2 space-y-6">
            {viewMode === "LIST" ? (
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900">All Bookings</h3>
                </div>
                {isLoading ? (
                  <div className="p-8 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
                    Loading bookings...
                  </div>
                ) : error ? (
                  <div className="p-8 text-center text-red-600 bg-red-50 flex items-center justify-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                ) : bookings.length === 0 ? (
                  <p className="p-8 text-center text-slate-400">No bookings recorded yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {bookings.map((booking) => {
                      const startStr = new Date(booking.startTime).toLocaleString();
                      const endStr = new Date(booking.endTime).toLocaleString();
                      const isOwner = currentUser?.id === booking.bookedBy;
                      const isApprover = ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"].includes(currentUser?.role || "");

                      return (
                        <div key={booking.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded border text-xs font-bold ${getStatusBadge(booking.status)}`}>
                                {booking.status}
                              </span>
                              <span className="text-sm font-bold text-slate-800">{booking.resourceType}</span>
                            </div>
                            <p className="text-sm text-slate-600 font-semibold">{booking.purpose}</p>
                            <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-semibold">
                              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {startStr} - {endStr}</span>
                              <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Booked by: {booking.user?.name || "Unknown"}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {booking.status === "PENDING" && isApprover && (
                              <>
                                <button 
                                  onClick={() => handleApprove(booking.id)}
                                  className="p-1 px-2 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded font-bold transition-colors flex items-center gap-1"
                                >
                                  <Check className="h-3 w-3" /> Approve
                                </button>
                                <button 
                                  onClick={() => handleReject(booking.id)}
                                  className="p-1 px-2 text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded font-bold transition-colors flex items-center gap-1"
                                >
                                  <X className="h-3 w-3" /> Reject
                                </button>
                              </>
                            )}
                            {booking.status === "PENDING" && (isOwner || isApprover) && (
                              <button 
                                onClick={() => handleCancel(booking.id)}
                                className="p-1 px-2 text-xs hover:bg-red-50 border text-red-600 rounded font-bold transition-colors flex items-center gap-1"
                              >
                                <X className="h-3 w-3" /> Cancel
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
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 uppercase tracking-wider mb-2">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>

                <div className="grid grid-cols-7 gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
                  {calendarDays.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} className="bg-white min-h-[90px] p-1.5" />;
                    
                    const dayBookings = getBookingsForDay(day);
                    const isToday = day.toISOString().split("T")[0] === today;

                    return (
                      <div 
                        key={day.toISOString()} 
                        className={`bg-white min-h-[90px] p-1.5 border border-slate-100 flex flex-col justify-between hover:bg-slate-50 transition-colors ${isToday ? "ring-2 ring-slate-900 ring-inset" : ""}`}
                      >
                        <span className={`text-xs font-bold ${isToday ? "text-slate-900" : "text-slate-400"}`}>{day.getDate()}</span>
                        
                        <div className="space-y-1 mt-1 flex-1 flex flex-col justify-end">
                          {dayBookings.slice(0, 2).map((b) => (
                            <div 
                              key={b.id} 
                              className={`text-[9px] font-bold p-0.5 px-1 rounded border overflow-hidden truncate ${b.status === "APPROVED" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-amber-50 text-amber-800 border-amber-100"}`}
                              title={`${b.resourceType}: ${b.purpose}`}
                            >
                              {b.resourceType.split(" ")[0]}: {b.purpose}
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
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-4">
              <h3 className="font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Clock className="h-5 w-5 text-slate-400" />
                Today's Bookings
              </h3>
              {todayBookings.length === 0 ? (
                <p className="text-slate-400 text-xs text-center py-4">No reservations scheduled for today.</p>
              ) : (
                <div className="space-y-3">
                  {todayBookings.map(b => (
                    <div key={b.id} className="p-3 border border-slate-150 rounded bg-slate-50 text-xs space-y-1">
                      <div className="flex justify-between items-center font-bold text-slate-800">
                        <span>{b.resourceType}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${b.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{b.status}</span>
                      </div>
                      <p className="text-slate-600 font-semibold">{b.purpose}</p>
                      <p className="text-slate-400 font-medium">
                        {new Date(b.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(b.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Schedule panel */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-4">
              <h3 className="font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
                <CalendarIcon className="h-5 w-5 text-slate-400" />
                Upcoming Requests
              </h3>
              {upcomingBookings.length === 0 ? (
                <p className="text-slate-400 text-xs text-center py-4">No upcoming reservations logged.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.slice(0, 5).map(b => (
                    <div key={b.id} className="p-3 border border-slate-150 rounded bg-slate-50 text-xs space-y-1">
                      <div className="flex justify-between items-center font-bold text-slate-800">
                        <span>{b.resourceType}</span>
                        <span className="text-slate-400 font-medium">{new Date(b.startTime).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-600 font-semibold">{b.purpose}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NEW BOOKING REQUEST MODAL */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-900">Request Resource Booking</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">Cancel</button>
              </div>

              {modalError && (
                <div className="p-3 mb-4 text-xs text-red-650 bg-red-50 border border-red-200 rounded flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleCreateBooking} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Resource Type</label>
                  <select 
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white focus:outline-none"
                  >
                    <option value="Meeting Room">Meeting Room</option>
                    <option value="Conference Hall">Conference Hall</option>
                    <option value="Projector">Projector</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Shared Device">Shared Device</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Resource ID (UUID)</label>
                  <input 
                    type="text" required placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                    value={resourceId}
                    onChange={(e) => setResourceId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Start Date & Time</label>
                  <input 
                    type="datetime-local" required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">End Date & Time</label>
                  <input 
                    type="datetime-local" required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Booking Purpose</label>
                  <textarea 
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="Specify booking description/purpose..."
                  />
                </div>

                <button type="submit" className="w-full py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-md text-sm font-semibold shadow-sm">
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
