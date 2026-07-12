// client/app/maintenance/page.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { 
  Plus, 
  Check, 
  X,
  UserPlus, 
  Clock, 
  Info, 
  ChevronLeft,
  ChevronRight,
  Activity,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

interface MaintenanceRequest {
  id: string;
  assetId: string;
  reportedBy: string;
  assignedTo?: string;
  issueTitle: string;
  description: string;
  priority: string;
  status: string;
  approvalStatus: string;
  createdAt: string;
  asset: {
    name: string;
    assetTag: string;
  };
  reporter: {
    name: string;
  };
  technician?: {
    name: string;
    email: string;
  };
}

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Current user details
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Raise Request Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assetId, setAssetId] = useState("");
  const [issueTitle, setIssueTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [modalError, setModalError] = useState<string | null>(null);

  // Assign Technician Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [assignedTo, setAssignedTo] = useState("");

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: statusFilter,
        priority: priorityFilter
      });

      const response = await api.get(`/maintenance?${queryParams.toString()}`);
      if (response.data.success) {
        setRequests(response.data.data.requests);
        setTotal(response.data.data.total);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load maintenance requests.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/users?limit=100"); // To select technician
      if (response.data.success) {
        setEmployees(response.data.data.users);
      }
    } catch (err) {
      console.error("Failed to load employees for assignment", err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchRequests();
    fetchEmployees();
  }, [page, statusFilter, priorityFilter]);

  const handleRaiseRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setModalError(null);
      const response = await api.post("/maintenance", {
        assetId,
        issueTitle,
        description,
        priority
      });
      if (response.data.success) {
        setIsAddModalOpen(false);
        resetFormStates();
        fetchRequests();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || "Failed to raise request. Ensure the asset is actively ALLOCATED to you.");
    }
  };

  const handleAssignTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      setModalError(null);
      const response = await api.patch(`/maintenance/${selectedRequest.id}`, {
        assignedTo
      });
      if (response.data.success) {
        setIsAssignModalOpen(false);
        resetFormStates();
        fetchRequests();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || "Failed to assign technician.");
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await api.patch(`/maintenance/${id}`, { status: newStatus });
      if (response.data.success) {
        fetchRequests();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status.");
    }
  };

  const handleApproveRequest = async (id: string, approvalStatus: "APPROVED" | "REJECTED") => {
    try {
      const response = await api.patch(`/maintenance/${id}`, { approvalStatus });
      if (response.data.success) {
        fetchRequests();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update approval status.");
    }
  };

  const resetFormStates = () => {
    setAssetId("");
    setIssueTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setAssignedTo("");
    setSelectedRequest(null);
    setModalError(null);
  };

  const getPriorityPillClass = (prio: string) => {
    switch (prio) {
      case "CRITICAL": return "status-pill-lost";
      case "HIGH": return "status-pill-maintenance";
      case "MEDIUM": return "status-pill-reserved";
      default: return "bg-slate-100 text-slate-500 border-slate-200/50";
    }
  };

  const getStatusPillClass = (status: string) => {
    switch (status) {
      case "RESOLVED": return "status-pill-available";
      case "IN_PROGRESS": return "status-pill-allocated";
      case "ASSIGNED": return "status-pill-allocated bg-purple-500/10 text-purple-500 border-purple-500/10";
      case "APPROVED": return "status-pill-available bg-teal-500/10 text-teal-500 border-teal-500/10";
      case "PENDING": return "status-pill-reserved";
      case "REJECTED": return "status-pill-lost";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const isPrivileged = ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"].includes(currentUser?.role || "");

  // KPI Calculations
  const pendingCount = requests.filter(r => r.status === "PENDING").length;
  const progressCount = requests.filter(r => r.status === "IN_PROGRESS").length;
  const criticalCount = requests.filter(r => r.priority === "CRITICAL" && r.status !== "RESOLVED").length;

  return (
    <Layout>
      <div className="space-y-8 animate-page-enter">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Maintenance Log</h1>
            <p className="text-xs text-slate-450 dark:text-slate-450 mt-1">Raise fault tickets, deploy technicians, and monitor ongoing repairs.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="apple-btn apple-btn-primary"
          >
            <Plus className="h-4 w-4" />
            Raise Request
          </button>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="premium-card p-6 bg-gradient-to-tr from-white/90 to-[#8B5CF6]/5 dark:from-[#15181D] dark:to-[#8B5CF6]/10">
            <p className="text-[10px] font-extrabold text-[#8B5CF6] uppercase tracking-widest">Pending Verification</p>
            <h3 className="text-3xl font-extrabold tracking-tight mt-3 text-foreground">{pendingCount} Requests</h3>
          </div>
          <div className="premium-card p-6 bg-gradient-to-tr from-white/90 to-[#007AFF]/5 dark:from-[#15181D] dark:to-[#007AFF]/10">
            <p className="text-[10px] font-extrabold text-[#007AFF] uppercase tracking-widest">Active Repairs</p>
            <h3 className="text-3xl font-extrabold tracking-tight mt-3 text-foreground">{progressCount} Active</h3>
          </div>
          <div className="premium-card p-6 bg-gradient-to-tr from-white/90 to-red-500/5 dark:from-[#15181D] dark:to-red-500/10">
            <p className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest">Urgent / Critical Failures</p>
            <h3 className="text-3xl font-extrabold tracking-tight mt-3 text-red-650 dark:text-red-400">{criticalCount} Unresolved</h3>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="glass-panel p-4 bg-white/50 dark:bg-[#15181D]/45 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-3 w-full sm:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="glass-input bg-white/95 dark:bg-[#15181D]/95 py-2 px-3 text-xs min-w-[140px]"
            >
              <option value="">Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select 
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              className="glass-input bg-white/95 dark:bg-[#15181D]/95 py-2 px-3 text-xs min-w-[140px]"
            >
              <option value="">Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="luxury-table-container">
          {isLoading ? (
            <div className="p-16 text-center text-slate-450">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
              Refreshing maintenance records...
            </div>
          ) : error ? (
            <div className="p-16 text-center text-red-655 bg-red-500/5 flex flex-col items-center justify-center gap-2">
              <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
              <p className="font-extrabold text-sm">{error}</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center justify-center bg-white dark:bg-[#15181D]">
              <Activity className="h-12 w-12 text-slate-350 dark:text-zinc-700 mb-3" />
              <p className="text-sm font-extrabold text-slate-500">No maintenance tickets found</p>
              <p className="text-xs text-slate-450 mt-1 max-w-[280px]">All devices are functional or filters are matching zero tickets.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="luxury-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Issue</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Technician</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td className="font-extrabold text-foreground">
                        <div>
                          <div className="text-foreground">{r.asset?.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{r.asset?.assetTag}</div>
                        </div>
                      </td>
                      <td className="font-semibold text-slate-650 dark:text-slate-300">
                        {r.issueTitle}
                      </td>
                      <td>
                        <span className={`status-pill ${getPriorityPillClass(r.priority)}`}>
                          {r.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${getStatusPillClass(r.status)}`}>
                          {r.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="font-semibold text-slate-500 dark:text-slate-400">
                        {r.technician?.name || "Unassigned"}
                      </td>
                      <td className="text-right space-x-1.5 whitespace-nowrap">
                        <Link 
                          href={`/maintenance/${r.id}`}
                          className="apple-btn apple-btn-secondary py-1.5 px-3"
                        >
                          <Info className="h-3.5 w-3.5" />
                          Details
                        </Link>
                        {isPrivileged && r.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApproveRequest(r.id, "APPROVED")}
                              className="apple-btn apple-btn-primary py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10 text-xs font-bold"
                            >
                              <Check className="h-3.5 w-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleApproveRequest(r.id, "REJECTED")}
                              className="apple-btn apple-btn-secondary py-1.5 px-3 text-red-500 border-red-500/10 hover:bg-red-500/5 text-xs font-bold"
                            >
                              <X className="h-3.5 w-3.5" /> Reject
                            </button>
                          </>
                        )}
                        {isPrivileged && r.status === "APPROVED" && (
                          <button
                            onClick={() => { setSelectedRequest(r); setIsAssignModalOpen(true); }}
                            className="apple-btn apple-btn-primary py-1.5 px-3 bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-purple-500/10 text-xs font-bold"
                          >
                            <UserPlus className="h-3.5 w-3.5" /> Assign
                          </button>
                        )}
                        {isPrivileged && r.status === "ASSIGNED" && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, "IN_PROGRESS")}
                            className="apple-btn apple-btn-primary py-1.5 px-3 bg-[#007AFF] hover:bg-[#0066CC] shadow-blue-500/10 text-xs font-bold"
                          >
                            <Clock className="h-3.5 w-3.5" /> Start Repair
                          </button>
                        )}
                        {isPrivileged && r.status === "IN_PROGRESS" && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, "RESOLVED")}
                            className="apple-btn apple-btn-primary py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10 text-xs font-bold"
                          >
                            <Check className="h-3.5 w-3.5" /> Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {Math.ceil(total / limit) > 1 && (
          <div className="glass-panel p-4 bg-white/50 dark:bg-[#15181D]/45 flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">
              Page {page} of {Math.ceil(total / limit) || 1}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="apple-btn apple-btn-secondary p-2 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => (p * limit < total ? p + 1 : p))}
                disabled={page * limit >= total}
                className="apple-btn apple-btn-secondary p-2 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* MODAL: RAISE MAINTENANCE REQUEST */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/40 backdrop-blur-md animate-page-enter">
            <div className="bg-white dark:bg-[#15181D] border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-2xl w-full max-w-md p-6 relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="window-dot dot-close" />
                    <span className="window-dot dot-minimize" />
                    <span className="window-dot dot-maximize" />
                  </div>
                  <h3 className="text-lg font-extrabold text-foreground">Raise Maintenance Request</h3>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="p-2 text-slate-450 hover:text-foreground rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 mb-4 text-xs text-red-650 bg-red-500/10 border border-red-500/15 rounded-2xl font-bold flex items-start gap-2">
                  <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleRaiseRequest} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Asset ID (UUID)</label>
                  <input 
                    type="text" required placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Issue Title</label>
                  <input 
                    type="text" required placeholder="e.g. Bulging laptop battery, Screen flickering"
                    value={issueTitle}
                    onChange={(e) => setIssueTitle(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Priority</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="glass-input bg-white/95 dark:bg-[#15181D]/95"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical Failure</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Description</label>
                  <textarea 
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="glass-input h-24 resize-none"
                    placeholder="Describe the failure mode in detail..."
                  />
                </div>

                <button type="submit" className="w-full apple-btn apple-btn-primary py-3">
                  Submit Maintenance Request
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ASSIGN TECHNICIAN */}
        {isAssignModalOpen && selectedRequest && (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/40 backdrop-blur-md animate-page-enter">
            <div className="bg-white dark:bg-[#15181D] border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-2xl w-full max-w-md p-6 relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="window-dot dot-close" />
                    <span className="window-dot dot-minimize" />
                    <span className="window-dot dot-maximize" />
                  </div>
                  <h3 className="text-lg font-extrabold text-foreground">Assign Technician</h3>
                </div>
                <button 
                  onClick={() => setIsAssignModalOpen(false)} 
                  className="p-2 text-slate-455 hover:text-foreground rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-6 font-semibold">Assigning: <span className="text-foreground font-extrabold">"{selectedRequest.issueTitle}"</span></p>

              {modalError && <div className="p-3 mb-4 text-xs text-red-600 bg-red-500/10 border border-red-500/15 rounded-2xl font-bold flex items-center gap-2">{modalError}</div>}

              <form onSubmit={handleAssignTechnician} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Select Technician</label>
                  <select 
                    required
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="glass-input bg-white/95 dark:bg-[#15181D]/95"
                  >
                    <option value="">Select Employee...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full apple-btn apple-btn-primary py-3">
                  Confirm Assignment
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
