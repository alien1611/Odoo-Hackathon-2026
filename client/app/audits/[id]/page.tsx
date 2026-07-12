// client/app/audits/[id]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { 
  ArrowLeft, 
  ChevronRight, 
  ClipboardCheck, 
  AlertCircle
} from "lucide-react";
import Link from "next/link";

interface AuditCycle {
  id: string;
  name: string;
  scope: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface AuditRecord {
  id: string;
  assetId: string;
  verificationStatus: string;
  remarks?: string;
  verifiedAt: string;
  asset: {
    assetTag: string;
    name: string;
    location: string;
    condition: string;
    status: string;
  };
  verifier: {
    name: string;
  };
}

interface Summary {
  totalVerified: number;
  missingCount: number;
  damagedCount: number;
  verifiedCount: number;
}

export default function AuditDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [cycle, setCycle] = useState<AuditCycle | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Verification states
  const [assetId, setAssetId] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("VERIFIED");
  const [remarks, setRemarks] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchAuditData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/audits/${id}/report`);
      if (response.data.success) {
        setCycle(response.data.data.cycle);
        setSummary(response.data.data.summary);
        setRecords(response.data.data.records);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load audit discrepancy report.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, [id]);

  const handleVerifyAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionError(null);
      setActionSuccess(null);
      
      const response = await api.post(`/audits/${id}/verify`, {
        assetId,
        verificationStatus,
        remarks
      });

      if (response.data.success) {
        setActionSuccess("Asset verification logged successfully!");
        setAssetId("");
        setRemarks("");
        fetchAuditData();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Verification failed. Check Asset ID UUID.");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8">
          <div className="h-6 w-32 bg-slate-200 dark:bg-zinc-800 rounded-xl"></div>
          <div className="h-48 bg-slate-250 dark:bg-zinc-800 rounded-3xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-96 bg-slate-250 dark:bg-zinc-800 rounded-3xl"></div>
            <div className="h-96 bg-slate-250 dark:bg-zinc-800 rounded-3xl"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !cycle) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-12 p-8 text-center bg-white dark:bg-[#15181D] rounded-3xl shadow-2xl border border-slate-250/20 dark:border-white/5 animate-page-enter">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-extrabold text-foreground mb-2">Error</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">{error || "Audit details not found"}</p>
          <Link href="/audits" className="apple-btn apple-btn-primary px-6 py-2.5">
            Back to Audits
          </Link>
        </div>
      </Layout>
    );
  }

  const getRecordStatusClass = (s: string) => {
    switch (s) {
      case "VERIFIED": return "status-pill-available";
      case "DAMAGED": return "status-pill-maintenance";
      case "MISSING": return "status-pill-lost";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <Layout>
      <div className="space-y-8 animate-page-enter">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-455 dark:text-slate-500">
          <Link href="/audits" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Audits
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{cycle.name}</span>
        </div>

        {/* Master Info Panel */}
        <div className="premium-card p-6 space-y-3">
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">{cycle.name}</h1>
            <span className="status-pill status-pill-allocated bg-blue-500/10 text-blue-505 border-blue-500/10">
              {cycle.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
            Scope: <span className="text-foreground font-bold">{cycle.scope}</span>
          </p>
          <div className="flex gap-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            <span>Start: {new Date(cycle.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>End: {new Date(cycle.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Discrepancy report summary card */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="premium-card p-5 bg-gradient-to-tr from-white/90 to-slate-500/5 dark:from-[#15181D] dark:to-slate-500/10">
              <p className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Total Audited</p>
              <h4 className="text-2xl font-extrabold tracking-tight mt-2 text-foreground">{summary.totalVerified} Assets</h4>
            </div>
            <div className="premium-card p-5 bg-gradient-to-tr from-white/90 to-emerald-500/5 dark:from-[#15181D] dark:to-emerald-500/10">
              <p className="text-[10px] font-extrabold text-emerald-505 uppercase tracking-widest">Verified & Intact</p>
              <h4 className="text-2xl font-extrabold tracking-tight mt-2 text-emerald-550 dark:text-emerald-400">{summary.verifiedCount} Assets</h4>
            </div>
            <div className="premium-card p-5 bg-gradient-to-tr from-white/90 to-amber-500/5 dark:from-[#15181D] dark:to-amber-500/10">
              <p className="text-[10px] font-extrabold text-amber-550 uppercase tracking-widest">Damaged / Needs Repair</p>
              <h4 className="text-2xl font-extrabold tracking-tight mt-2 text-amber-550 dark:text-amber-400">{summary.damagedCount} Assets</h4>
            </div>
            <div className="premium-card p-5 bg-gradient-to-tr from-white/90 to-red-500/5 dark:from-[#15181D] dark:to-red-500/10">
              <p className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest">Missing / Lost</p>
              <h4 className="text-2xl font-extrabold tracking-tight mt-2 text-red-650 dark:text-red-400">{summary.missingCount} Assets</h4>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Audit Verification Log list */}
          <div className="lg:col-span-2 luxury-table-container">
            <div className="px-6 py-4 border-b border-slate-200/20 dark:border-white/5 bg-slate-50/50 dark:bg-white/1">
              <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-450">Verification Log</h3>
            </div>

            {records.length === 0 ? (
              <p className="p-16 text-center text-slate-450 italic font-semibold">No assets verified in this cycle yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="luxury-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Auditor</th>
                      <th>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r.id}>
                        <td className="font-extrabold text-foreground">
                          <div>
                            <div>{r.asset?.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Tag: {r.asset?.assetTag}</div>
                          </div>
                        </td>
                        <td className="font-semibold text-slate-500 dark:text-slate-400">
                          {r.verifier?.name}
                        </td>
                        <td>
                          <span className={`status-pill ${getRecordStatusClass(r.verificationStatus)}`}>
                            {r.verificationStatus}
                          </span>
                        </td>
                        <td className="font-semibold text-slate-400 max-w-xs truncate">
                          {r.remarks || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Audit Verification Form Checklist (Asset Verification Tool) */}
          {["OPEN", "ACTIVE"].includes(cycle.status) ? (
            <div className="premium-card p-6 h-fit space-y-4">
              <h3 className="text-base font-extrabold tracking-tight flex items-center gap-2 border-b border-slate-100/50 dark:border-white/5 pb-3">
                <ClipboardCheck className="h-5 w-5 text-slate-400" />
                Auditor panel
              </h3>

              {actionError && (
                <div className="p-3 text-xs text-red-650 bg-red-505/10 border border-red-500/15 rounded-2xl font-bold">
                  {actionError}
                </div>
              )}
              {actionSuccess && (
                <div className="p-3 text-xs text-emerald-700 bg-emerald-500/10 border border-emerald-500/15 rounded-2xl font-bold">
                  {actionSuccess}
                </div>
              )}

              <form onSubmit={handleVerifyAsset} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-455 dark:text-slate-500 uppercase tracking-wider pl-1">Asset ID (UUID)</label>
                  <input 
                    type="text" required placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-455 dark:text-slate-500 uppercase tracking-wider pl-1">Verification Status</label>
                  <select 
                    value={verificationStatus}
                    onChange={(e) => setVerificationStatus(e.target.value)}
                    className="glass-input bg-white/95 dark:bg-[#15181D]/95"
                  >
                    <option value="VERIFIED">Verified & Intact</option>
                    <option value="DAMAGED">Damaged / Needs Repair</option>
                    <option value="MISSING">Missing / Flag Lost</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-455 dark:text-slate-500 uppercase tracking-wider pl-1">Verification Remarks</label>
                  <textarea 
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="glass-input h-24 resize-none"
                    placeholder="Enter observation comments..."
                  />
                </div>

                <button type="submit" className="w-full apple-btn apple-btn-primary py-3">
                  Log Audit Record
                </button>
              </form>
            </div>
          ) : (
            <div className="premium-card p-6 text-center text-slate-400 font-bold space-y-3 h-fit">
              <ClipboardCheck className="h-8 w-8 mx-auto text-slate-300 dark:text-zinc-700" />
              <p className="text-sm">Audit Cycle Closed</p>
              <p className="text-xs font-semibold text-slate-400 leading-relaxed">Verification records are disabled for closed cycles.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
