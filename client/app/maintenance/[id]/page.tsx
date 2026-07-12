// client/app/maintenance/[id]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { 
  ArrowLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Activity, 
  Check, 
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
        <div className="animate-pulse space-y-8">
          <div className="h-6 w-32 bg-slate-200 dark:bg-zinc-800 rounded-xl"></div>
          <div className="h-48 bg-slate-250 dark:bg-zinc-800 rounded-3xl"></div>
          <div className="h-96 bg-slate-250 dark:bg-zinc-800 rounded-3xl"></div>
        </div>
      </Layout>
    );
  }

  if (error || !request) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-12 p-8 text-center bg-white dark:bg-[#15181D] rounded-3xl shadow-2xl border border-slate-250/20 dark:border-white/5 animate-page-enter">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-extrabold text-foreground mb-2">Error</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">{error || "Maintenance request not found"}</p>
          <Link href="/maintenance" className="apple-btn apple-btn-primary px-6 py-2.5">
            Back to Maintenance
          </Link>
        </div>
      </Layout>
    );
  }

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

  // Formulate a status timeline helper
  const statuses = ["PENDING", "APPROVED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];
  const currentIdx = statuses.indexOf(request.status);

  return (
    <Layout>
      <div className="space-y-8 animate-page-enter">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-450 dark:text-slate-500">
          <Link href="/maintenance" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Maintenance
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Request Details</span>
        </div>

        {/* Master Info Panel */}
        <div className="premium-card p-6 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-extrabold tracking-tight text-foreground">{request.issueTitle}</h1>
                <span className={`status-pill ${getPriorityPillClass(request.priority)}`}>
                  {request.priority}
                </span>
                <span className={`status-pill ${getStatusPillClass(request.status)}`}>
                  {request.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs font-extrabold text-slate-450 mt-1">Ticket ID: <span className="text-foreground">{request.id}</span></p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isPrivileged && request.status === "ASSIGNED" && (
                <button
                  onClick={() => handleUpdateStatus("IN_PROGRESS")}
                  className="apple-btn apple-btn-primary py-2 px-4 text-xs font-bold"
                >
                  Start Work
                </button>
              )}
              {isPrivileged && request.status === "IN_PROGRESS" && (
                <button
                  onClick={() => handleUpdateStatus("RESOLVED")}
                  className="apple-btn apple-btn-primary py-2 px-4 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10 text-xs font-bold"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100/50 dark:border-white/5 pt-4 text-sm text-slate-700 space-y-2">
            <p className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest pl-1">Issue Description</p>
            <p className="bg-slate-50/50 dark:bg-white/1 p-5 rounded-2xl border border-slate-200/50 dark:border-white/5 text-xs text-slate-550 dark:text-slate-350 whitespace-pre-line font-semibold leading-relaxed">
              {request.description}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Asset & Personnel specifications */}
          <div className="lg:col-span-2 premium-card p-6 space-y-6">
            <h3 className="text-base font-extrabold tracking-tight border-b border-slate-100/50 dark:border-white/5 pb-3">Ticket properties</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Asset Details</p>
                <div className="mt-3 space-y-1.5 text-xs font-bold text-slate-500 dark:text-slate-450">
                  <p className="text-foreground text-sm font-extrabold">{request.asset?.name}</p>
                  <p>Tag: <span className="text-foreground">{request.asset?.assetTag}</span></p>
                  <p>Serial: <span className="text-foreground">{request.asset?.serialNumber}</span></p>
                  <p>Location: <span className="text-foreground">{request.asset?.location}</span></p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Stakeholders</p>
                <div className="mt-3 space-y-3.5 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-450 uppercase tracking-wider font-extrabold block">Reported By</span>
                    <span className="font-bold text-foreground mt-0.5 inline-block">{request.reporter?.name}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{request.reporter?.email}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-450 uppercase tracking-wider font-extrabold block">Assigned Technician</span>
                    <span className="font-bold text-foreground mt-0.5 inline-block">{request.technician?.name || "Unassigned"}</span>
                    {request.technician?.email && (
                      <span className="block text-[10px] text-slate-400 mt-0.5">{request.technician?.email}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow progress timeline */}
          <div className="premium-card p-6">
            <h3 className="text-base font-extrabold tracking-tight border-b border-slate-100/50 dark:border-white/5 pb-3 mb-6">Workflow Progress</h3>

            <div className="space-y-1 pl-1">
              {statuses.map((stat, idx) => {
                const isActive = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={stat} className="timeline-item">
                    <span className={`timeline-dot ${
                      isCurrent 
                        ? "bg-[#007AFF] box-shadow-none" 
                        : isActive 
                        ? "bg-emerald-500 shadow-none" 
                        : "bg-slate-200 dark:bg-zinc-800"
                    }`} />
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className={`text-xs font-extrabold tracking-wider ${isActive ? "text-foreground" : "text-slate-350 dark:text-zinc-700"}`}>
                          {stat}
                        </p>
                        {isCurrent && (
                          <p className="text-[9px] text-slate-400 mt-1 font-bold">
                            Active: {new Date(request.updatedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
