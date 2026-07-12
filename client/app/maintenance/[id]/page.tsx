// client/app/maintenance/[id]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { 
  ArrowLeft, 
  ChevronRight, 
  Wrench, 
  Clock, 
  User, 
  Activity, 
  AlertTriangle, 
  Check, 
  ShieldAlert,
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
  updatedAt: string;
  asset: {
    name: string;
    assetTag: string;
    serialNumber: string;
    location: string;
  };
  reporter: {
    name: string;
    email: string;
  };
  technician?: {
    name: string;
    email: string;
  };
}

export default function MaintenanceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchRequestDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/maintenance/${id}`);
      if (response.data.success) {
        setRequest(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load request details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchRequestDetails();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const response = await api.patch(`/maintenance/${id}`, { status: newStatus });
      if (response.data.success) {
        fetchRequestDetails();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status.");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 bg-slate-200 rounded"></div>
          <div className="h-48 bg-white border border-slate-200 rounded-lg"></div>
          <div className="h-96 bg-white border border-slate-200 rounded-lg"></div>
        </div>
      </Layout>
    );
  }

  if (error || !request) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-10 p-6 bg-white border border-slate-200 rounded-lg text-center shadow-sm">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Error</h3>
          <p className="text-slate-500 text-sm mb-4">{error || "Maintenance request not found"}</p>
          <Link href="/maintenance" className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm font-semibold">
            Back to Maintenance
          </Link>
        </div>
      </Layout>
    );
  }

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

  // Formulate a status timeline helper
  const statuses = ["PENDING", "APPROVED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];
  const currentIdx = statuses.indexOf(request.status);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
          <Link href="/maintenance" className="hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Maintenance Requests
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-slate-900 font-bold">Request Detail</span>
        </div>

        {/* Master Info Panel */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900">{request.issueTitle}</h1>
                <span className={`px-2.5 py-0.5 rounded border text-xs font-bold ${getPriorityBadge(request.priority)}`}>
                  {request.priority}
                </span>
                <span className={`px-2.5 py-0.5 rounded border text-xs font-bold ${getStatusBadge(request.status)}`}>
                  {request.status}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-400">Request ID: <span className="text-slate-700">{request.id}</span></p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isPrivileged && request.status === "ASSIGNED" && (
                <button
                  onClick={() => handleUpdateStatus("IN_PROGRESS")}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow transition-colors"
                >
                  Start Work
                </button>
              )}
              {isPrivileged && request.status === "IN_PROGRESS" && (
                <button
                  onClick={() => handleUpdateStatus("RESOLVED")}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow transition-colors"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 text-sm text-slate-700 space-y-2">
            <p className="font-bold text-slate-400 uppercase tracking-wider text-xs">Issue Description</p>
            <p className="bg-slate-50 p-4 rounded border border-slate-150 whitespace-pre-line font-medium leading-relaxed">
              {request.description}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Asset & Personnel specifications */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">References</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Asset Details</p>
                <div className="mt-2 space-y-1 text-sm font-semibold text-slate-700">
                  <p className="text-slate-900 font-bold">{request.asset?.name}</p>
                  <p className="text-xs text-slate-400">Tag: {request.asset?.assetTag}</p>
                  <p className="text-xs text-slate-400">Serial: {request.asset?.serialNumber}</p>
                  <p className="text-xs text-slate-400">Location: {request.asset?.location}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stakeholders</p>
                <div className="mt-2 space-y-3 text-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">Reported By</span>
                    <span className="font-semibold text-slate-700">{request.reporter?.name} ({request.reporter?.email})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block">Assigned Technician</span>
                    <span className="font-semibold text-slate-700">{request.technician?.name || "Unassigned"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow progress timeline */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6">Workflow Status</h3>

            <div className="flow-root">
              <ul className="-mb-8">
                {statuses.map((stat, idx) => {
                  const isActive = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <li key={stat}>
                      <div className="relative pb-8">
                        {idx !== statuses.length - 1 && (
                          <span className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${isActive ? "bg-slate-900" : "bg-slate-200"}`} aria-hidden="true" />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              isCurrent 
                                ? "bg-slate-900 text-white font-extrabold" 
                                : isActive 
                                ? "bg-slate-200 text-slate-800" 
                                : "bg-slate-50 text-slate-300 border border-slate-200"
                            }`}>
                              {idx + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-slate-900 font-extrabold" : "text-slate-300 font-semibold"}`}>
                                {stat}
                              </p>
                              {isCurrent && (
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Last active: {new Date(request.updatedAt).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
