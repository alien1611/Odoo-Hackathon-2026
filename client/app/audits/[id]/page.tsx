// client/app/audits/[id]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { 
  ArrowLeft, 
  ChevronRight, 
  Layers, 
  Clock, 
  ClipboardCheck, 
  Check, 
  AlertTriangle, 
  X,
  Plus,
  Search,
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
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 bg-slate-200 rounded"></div>
          <div className="h-48 bg-white border border-slate-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-96 bg-white border border-slate-200 rounded-lg"></div>
            <div className="h-96 bg-white border border-slate-200 rounded-lg"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !cycle) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-10 p-6 bg-white border border-slate-200 rounded-lg text-center shadow-sm">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Error</h3>
          <p className="text-slate-500 text-sm mb-4">{error || "Audit details not found"}</p>
          <Link href="/audits" className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm font-semibold">
            Back to Audits
          </Link>
        </div>
      </Layout>
    );
  }

  const getRecordStatusClass = (s: string) => {
    switch (s) {
      case "VERIFIED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "DAMAGED": return "bg-amber-50 text-amber-700 border-amber-200";
      case "MISSING": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
          <Link href="/audits" className="hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Audit Cycles
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-slate-900 font-bold">{cycle.name}</span>
        </div>

        {/* Master Info Panel */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-3">
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-xl font-bold text-slate-900">{cycle.name}</h1>
            <span className="px-2.5 py-0.5 rounded border text-xs font-bold bg-blue-50 text-blue-700 border-blue-200">
              {cycle.status}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-400">Scope: <span className="text-slate-700">{cycle.scope}</span></p>
          <div className="flex gap-4 text-xs font-semibold text-slate-400">
            <span>Start Date: {new Date(cycle.startDate).toLocaleDateString()}</span>
            <span>End Date: {new Date(cycle.endDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Discrepancy report summary card */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Audited</p>
              <h4 className="text-2xl font-bold text-slate-900 mt-1">{summary.totalVerified} Assets</h4>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-emerald-600">Verified & Intact</p>
              <h4 className="text-2xl font-bold text-emerald-600 mt-1">{summary.verifiedCount} Assets</h4>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-amber-600">Damaged Assets</p>
              <h4 className="text-2xl font-bold text-amber-600 mt-1">{summary.damagedCount} Assets</h4>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-red-650">Missing Assets</p>
              <h4 className="text-2xl font-bold text-red-600 mt-1">{summary.missingCount} Assets</h4>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Audit Verification Log list */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Audit Verification Records</h3>
            </div>

            {records.length === 0 ? (
              <p className="p-8 text-center text-slate-400">No assets verified in this cycle yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Asset</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Auditor</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {records.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                          <div>
                            <div>{r.asset?.name}</div>
                            <div className="text-xs text-slate-400">Tag: {r.asset?.assetTag}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-semibold">
                          {r.verifier?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getRecordStatusClass(r.verificationStatus)}`}>
                            {r.verificationStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-semibold max-w-xs truncate">
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
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-4 h-fit">
              <h3 className="font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
                <ClipboardCheck className="h-5 w-5 text-slate-400" />
                Auditor Verification Panel
              </h3>

              {actionError && <div className="p-3 text-xs text-red-650 bg-red-50 border border-red-200 rounded">{actionError}</div>}
              {actionSuccess && <div className="p-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded">{actionSuccess}</div>}

              <form onSubmit={handleVerifyAsset} className="space-y-4">
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
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Verification Status</label>
                  <select 
                    value={verificationStatus}
                    onChange={(e) => setVerificationStatus(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white focus:outline-none"
                  >
                    <option value="VERIFIED">Verified & Intact</option>
                    <option value="DAMAGED">Damaged / Needs repair</option>
                    <option value="MISSING">Missing / Flag Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Verification Remarks</label>
                  <textarea 
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm h-24 resize-none focus:outline-none"
                    placeholder="Enter visual observation comments..."
                  />
                </div>

                <button type="submit" className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-sm font-bold shadow-sm transition-colors">
                  Log Audit Record
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center text-slate-400 font-bold space-y-2 h-fit">
              <ClipboardCheck className="h-8 w-8 mx-auto text-slate-300" />
              <p className="text-sm">Audit cycle is closed.</p>
              <p className="text-xs font-normal text-slate-400">Verifications are disabled for this cycle.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
