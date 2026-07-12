// client/app/maintenance/page.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { 
  Plus, 
  Wrench, 
  AlertTriangle, 
  Check, 
  X,
  UserPlus, 
  Clock, 
  Info, 
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
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
      const response = await api.get("/employees"); // To select technician
      if (response.data.success) {
        setEmployees(response.data.data);
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

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case "CRITICAL": return "bg-red-50 text-red-700 border-red-200";
      case "HIGH": return "bg-orange-50 text-orange-700 border-orange-200";
      case "MEDIUM": return "bg-amber-50 text-amber-700 border-amber-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "IN_PROGRESS": return "bg-blue-50 text-blue-700 border-blue-200";
      case "ASSIGNED": return "bg-purple-50 text-purple-700 border-purple-200";
      case "APPROVED": return "bg-teal-50 text-teal-700 border-teal-200";
      case "PENDING": return "bg-amber-50 text-amber-700 border-amber-200";
      case "REJECTED": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const isPrivileged = ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"].includes(currentUser?.role || "");

  // KPI Calculations
  const pendingCount = requests.filter(r => r.status === "PENDING").length;
  const progressCount = requests.filter(r => r.status === "IN_PROGRESS").length;
  const criticalCount = requests.filter(r => r.priority === "CRITICAL" && r.status !== "RESOLVED").length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Maintenance & Repairs</h1>
            <p className="text-sm text-slate-500 mt-1">Manage asset faults, technician assignment, and repair status progressions.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors text-sm font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Raise Request
          </button>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{pendingCount} Requests</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Repairs</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{progressCount} In Progress</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical Failures</p>
            <h3 className="text-2xl font-bold text-red-600 mt-2">{criticalCount} Active</h3>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
          <div className="flex flex-1 gap-3">
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:outline-none"
            >
              <option value="">All Statuses</option>
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
              className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
              Loading requests...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 bg-red-50 flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          ) : requests.length === 0 ? (
            <p className="p-12 text-center text-slate-400">No maintenance requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Issue</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Technician</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {requests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                        <div>
                          <div>{r.asset?.name}</div>
                          <div className="text-xs text-slate-400">{r.asset?.assetTag}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-semibold">
                        {r.issueTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2.5 py-0.5 rounded border text-xs font-bold ${getPriorityBadge(r.priority)}`}>
                          {r.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2.5 py-0.5 rounded border text-xs font-bold ${getStatusBadge(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-semibold">
                        {r.technician?.name || "Unassigned"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold space-x-2">
                        <Link 
                          href={`/maintenance/${r.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded font-bold transition-colors"
                        >
                          <Info className="h-3 w-3" />
                          Details
                        </Link>
                        {isPrivileged && r.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApproveRequest(r.id, "APPROVED")}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors font-bold"
                            >
                              <Check className="h-3 w-3" /> Approve
                            </button>
                            <button
                              onClick={() => handleApproveRequest(r.id, "REJECTED")}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors font-bold"
                            >
                              <X className="h-3 w-3" /> Reject
                            </button>
                          </>
                        )}
                        {isPrivileged && r.status === "APPROVED" && (
                          <button
                            onClick={() => { setSelectedRequest(r); setIsAssignModalOpen(true); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded transition-colors font-bold"
                          >
                            <UserPlus className="h-3 w-3" /> Assign
                          </button>
                        )}
                        {isPrivileged && r.status === "ASSIGNED" && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, "IN_PROGRESS")}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors font-bold"
                          >
                            <Activity className="h-3 w-3" /> Start Repair
                          </button>
                        )}
                        {isPrivileged && r.status === "IN_PROGRESS" && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, "RESOLVED")}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors font-bold"
                          >
                            <Check className="h-3 w-3" /> Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-slate-500 font-semibold">
              Showing <span className="font-bold text-slate-800">{requests.length}</span> of <span className="font-bold text-slate-800">{total}</span> requests
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2 border border-slate-300 bg-white hover:bg-slate-100 rounded-md disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => (p * limit < total ? p + 1 : p))}
                disabled={page * limit >= total}
                className="p-2 border border-slate-300 bg-white hover:bg-slate-100 rounded-md disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* MODAL: RAISE MAINTENANCE REQUEST */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-900">Raise Maintenance Request</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">Cancel</button>
              </div>

              {modalError && (
                <div className="p-3 mb-4 text-xs text-red-655 bg-red-50 border border-red-200 rounded flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleRaiseRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Asset ID (UUID)</label>
                  <input 
                    type="text" required placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Issue Title</label>
                  <input 
                    type="text" required placeholder="e.g. Battery bulging, Screen flickering"
                    value={issueTitle}
                    onChange={(e) => setIssueTitle(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical Failure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                  <textarea 
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="Describe the failure mode in detail..."
                  />
                </div>

                <button type="submit" className="w-full py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-md text-sm font-semibold shadow-sm">
                  Submit Maintenance Request
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ASSIGN TECHNICIAN */}
        {isAssignModalOpen && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-900">Assign Technician</h3>
                <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600">Cancel</button>
              </div>
              <p className="text-sm text-slate-500 mb-4">Assigning task: <span className="font-semibold text-slate-850">"{selectedRequest.issueTitle}"</span></p>

              {modalError && <div className="p-3 mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded">{modalError}</div>}

              <form onSubmit={handleAssignTechnician} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Technician</label>
                  <select 
                    required
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white focus:outline-none"
                  >
                    <option value="">Select Employee...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-md text-sm font-semibold">
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
