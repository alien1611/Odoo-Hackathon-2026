// client/app/audits/page.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { 
  Plus, 
  ClipboardCheck, 
  Calendar, 
  Layers, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  AlertTriangle,
  Info
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CLOSED": return "bg-slate-50 text-slate-700 border-slate-200";
      case "ACTIVE": return "bg-blue-50 text-blue-700 border-blue-200";
      case "OPEN": return "bg-amber-50 text-amber-700 border-amber-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const isManager = ["ADMIN", "ASSET_MANAGER"].includes(currentUser?.role || "");

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Physical Asset Audits</h1>
            <p className="text-sm text-slate-500 mt-1">Initialize audit cycles, verify asset statuses, and inspect discrepancy reports.</p>
          </div>
          {isManager && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors text-sm font-semibold shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create Audit Cycle
            </button>
          )}
        </div>

        {/* Cycles Listing Grid */}
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
            Loading audit cycles...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-650 bg-red-50 flex items-center justify-center gap-2 border border-red-200 rounded">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : cycles.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-lg text-slate-400">
            No audit cycles recorded.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cycles.map((cycle) => (
              <div key={cycle.id} className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`px-2.5 py-0.5 rounded border text-xs font-bold ${getStatusBadge(cycle.status)}`}>
                      {cycle.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Created by: {cycle.creator?.name || "System"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 truncate">{cycle.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{cycle.scope}</p>

                  <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-slate-400">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(cycle.startDate).toLocaleDateString()}</span>
                    <span>to</span>
                    <span>{new Date(cycle.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 mt-5 pt-4 flex justify-between items-center">
                  <div className="flex gap-2">
                    {isManager && cycle.status === "OPEN" && (
                      <button 
                        onClick={() => handleUpdateStatus(cycle.id, "ACTIVE")}
                        className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded hover:bg-blue-100 transition-colors"
                      >
                        Start Audit
                      </button>
                    )}
                    {isManager && cycle.status === "ACTIVE" && (
                      <button 
                        onClick={() => handleUpdateStatus(cycle.id, "COMPLETED")}
                        className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded hover:bg-emerald-100 transition-colors"
                      >
                        Complete Audit
                      </button>
                    )}
                    {isManager && cycle.status === "COMPLETED" && (
                      <button 
                        onClick={() => handleUpdateStatus(cycle.id, "CLOSED")}
                        className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded hover:bg-slate-200 transition-colors"
                      >
                        Close Cycle
                      </button>
                    )}
                  </div>
                  <Link 
                    href={`/audits/${cycle.id}`}
                    className="flex items-center gap-1.5 text-xs text-slate-900 hover:underline font-bold"
                  >
                    Inspect <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CREATE AUDIT CYCLE MODAL */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-900">Create Audit Cycle</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">Cancel</button>
              </div>

              {modalError && (
                <div className="p-3 mb-4 text-xs text-red-656 bg-red-50 border border-red-200 rounded flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleCreateCycle} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cycle Name</label>
                  <input 
                    type="text" required placeholder="e.g. Q3 2026 Laptop Audit"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Audit Scope</label>
                  <textarea 
                    required
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm h-20 resize-none focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    placeholder="Describe scope (e.g. All developer macbooks across headquarters)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
                    <input 
                      type="date" required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
                    <input 
                      type="date" required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-md text-sm font-semibold shadow-sm">
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
