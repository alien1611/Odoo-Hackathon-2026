// client/app/audits/page.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { 
  Plus, 
  Calendar, 
  ChevronRight, 
  AlertCircle,
  AlertTriangle,
  X
} from "lucide-react";
import Link from "next/link";

interface AuditCycle {
  id: string;
  name: string;
  scope: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  creator?: {
    name: string;
  };
}

export default function AuditsPage() {
  const [cycles, setCycles] = useState<AuditCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Current user details
  const [currentUser, setCurrentUser] = useState<any>(null);

  // New Cycle Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [scope, setScope] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchCycles = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/audits");
      if (response.data.success) {
        setCycles(response.data.data.cycles);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load audit cycles.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchCycles();
  }, []);

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setModalError(null);
      const response = await api.post("/audits", {
        name,
        scope,
        startDate,
        endDate
      });
      if (response.data.success) {
        setIsAddModalOpen(false);
        resetFormStates();
        fetchCycles();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || "Failed to create audit cycle. Verify dates order.");
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await api.patch(`/audits/${id}`, { status: newStatus });
      if (response.data.success) {
        fetchCycles();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update audit status.");
    }
  };

  const resetFormStates = () => {
    setName("");
    setScope("");
    setStartDate("");
    setEndDate("");
    setModalError(null);
  };

  const getStatusPillClass = (status: string) => {
    switch (status) {
      case "COMPLETED": return "status-pill-available";
      case "CLOSED": return "bg-slate-100 text-slate-500 border-slate-200/50";
      case "ACTIVE": return "status-pill-allocated";
      case "OPEN": return "status-pill-reserved";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const isManager = ["ADMIN", "ASSET_MANAGER"].includes(currentUser?.role || "");

  return (
    <Layout>
      <div className="space-y-8 animate-page-enter">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Asset Audits</h1>
            <p className="text-xs text-slate-450 dark:text-slate-450 mt-1">Configure verification cycles, analyze discrepancies, and approve reports.</p>
          </div>
          {isManager && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="apple-btn apple-btn-primary"
            >
              <Plus className="h-4 w-4" />
              Create Audit Cycle
            </button>
          )}
        </div>

        {/* Cycles Listing Grid */}
        {isLoading ? (
          <div className="p-16 text-center text-slate-450">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
            Refreshing cycles...
          </div>
        ) : error ? (
          <div className="p-16 text-center text-red-655 bg-red-500/5 flex flex-col items-center justify-center gap-2 rounded-2xl border border-red-500/10">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="font-extrabold text-sm">{error}</p>
          </div>
        ) : cycles.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center bg-white dark:bg-[#15181D] rounded-3xl border border-slate-250/20 dark:border-white/5">
            <AlertCircle className="h-12 w-12 text-slate-350 dark:text-zinc-700 mb-3" />
            <p className="text-sm font-extrabold text-slate-500">No audit cycles open</p>
            <p className="text-xs text-slate-450 mt-1 max-w-[280px]">Audit cycles organize verification reports. Create a cycle to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cycles.map((cycle) => (
              <div key={cycle.id} className="premium-card p-6 flex flex-col justify-between min-h-[220px]">
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`status-pill ${getStatusPillClass(cycle.status)}`}>
                      {cycle.status}
                    </span>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
                      BY: {cycle.creator?.name || "System"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold tracking-tight text-foreground truncate">{cycle.name}</h3>
                    <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold line-clamp-2 mt-1.5 leading-relaxed">{cycle.scope}</p>
                  </div>

                  <div className="pt-1 flex items-center gap-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(cycle.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    <span>to</span>
                    <span>{new Date(cycle.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100/50 dark:border-white/5 mt-5 pt-4 flex justify-between items-center">
                  <div className="flex gap-2">
                    {isManager && cycle.status === "OPEN" && (
                      <button 
                        onClick={() => handleUpdateStatus(cycle.id, "ACTIVE")}
                        className="apple-btn apple-btn-secondary py-1.5 px-3 text-[#007AFF] border-[#007AFF]/10 hover:bg-[#007AFF]/5 text-xs font-bold"
                      >
                        Start Audit
                      </button>
                    )}
                    {isManager && cycle.status === "ACTIVE" && (
                      <button 
                        onClick={() => handleUpdateStatus(cycle.id, "COMPLETED")}
                        className="apple-btn apple-btn-primary py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10 text-xs font-bold"
                      >
                        Complete Audit
                      </button>
                    )}
                    {isManager && cycle.status === "COMPLETED" && (
                      <button 
                        onClick={() => handleUpdateStatus(cycle.id, "CLOSED")}
                        className="apple-btn apple-btn-secondary py-1.5 px-3 text-slate-500 border-slate-200/20 hover:bg-slate-100/50 text-xs font-bold"
                      >
                        Close Cycle
                      </button>
                    )}
                  </div>
                  <Link 
                    href={`/audits/${cycle.id}`}
                    className="flex items-center gap-1 text-xs text-foreground hover:underline font-extrabold group"
                  >
                    Inspect
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CREATE AUDIT CYCLE MODAL */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/40 backdrop-blur-md animate-page-enter">
            <div className="bg-white dark:bg-[#15181D] border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-2xl w-full max-w-md p-6 relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  {/* macOS dots visual */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="window-dot dot-close" />
                    <span className="window-dot dot-minimize" />
                    <span className="window-dot dot-maximize" />
                  </div>
                  <h3 className="text-lg font-extrabold text-foreground">Create Audit Cycle</h3>
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
                  <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleCreateCycle} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Cycle Name</label>
                  <input 
                    type="text" required placeholder="e.g. Q3 2026 Laptop Audit"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Audit Scope</label>
                  <textarea 
                    required
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="glass-input h-20 resize-none"
                    placeholder="e.g. All engineering workstations in main office"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Start Date</label>
                    <input 
                      type="date" required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">End Date</label>
                    <input 
                      type="date" required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="glass-input"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full apple-btn apple-btn-primary py-3 mt-2">
                  Create Cycle
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
