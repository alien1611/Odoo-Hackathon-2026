// client/app/reports/page.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { 
  Download, 
  BarChart3, 
  Calendar, 
  Wrench, 
  ClipboardCheck, 
  Activity,
  AlertCircle
} from "lucide-react";

interface ReportsData {
  kpi: {
    assetsUnderMaintenance: number;
    pendingMaintenanceRequests: number;
    overdueMaintenanceCount: number;
    missingAssets: number;
  };
  charts: {
    assetsByStatus: Array<{ status: string; _count: { id: number } }>;
    maintenanceByStatus: Array<{ status: string; _count: { id: number } }>;
    departmentUtilization: Array<{ departmentId: string; departmentName: string; count: number }>;
    bookingsByResource: Array<{ resourceType: string; status: string; _count: { id: number } }>;
    auditFindings: Array<{ verificationStatus: string; _count: { id: number } }>;
    mostAllocatedAssets: Array<{ assetId: string; name: string; assetTag: string; allocationCount: number }>;
  };
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReportsData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/reports/dashboard");
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load reports and analytics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const triggerCsvDownload = async (endpoint: string, filename: string) => {
    try {
      const response = await api.get(endpoint, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to export report CSV.");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8">
          <div className="h-10 w-64 bg-slate-200 dark:bg-zinc-800 rounded-2xl"></div>
          <div className="h-28 bg-slate-200 dark:bg-zinc-800 rounded-3xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-zinc-800 rounded-3xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-96 bg-slate-200 dark:bg-zinc-800 rounded-3xl"></div>
            <div className="h-96 bg-slate-200 dark:bg-zinc-800 rounded-3xl"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-12 p-8 text-center bg-white dark:bg-[#15181D] rounded-3xl shadow-2xl border border-slate-250/20 dark:border-white/5 animate-page-enter">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-extrabold text-foreground mb-2">Metrics Offline</h3>
          <p className="text-slate-550 dark:text-slate-400 text-xs mb-6">{error || "An error occurred loading reports."}</p>
          <button 
            onClick={fetchReportsData}
            className="apple-btn apple-btn-primary px-6 py-2.5"
          >
            Reconnect Metrics
          </button>
        </div>
      </Layout>
    );
  }

  const totalAssetsCount = data.charts.assetsByStatus.reduce((sum, item) => sum + item._count.id, 0);

  return (
    <Layout>
      <div className="space-y-8 animate-page-enter">
        
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Analytics Center</h1>
          <p className="text-xs text-slate-450 dark:text-slate-450 mt-1">Export activity logs, review asset life states, and analyze department utilization.</p>
        </div>

        {/* Export Toolbar panel */}
        <div className="glass-panel p-6 bg-white/50 dark:bg-[#15181D]/45">
          <h3 className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Download className="h-4.5 w-4.5 text-[#007AFF]" /> Data Exporters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => triggerCsvDownload('/reports/assets?export=csv', 'asset_utilization_report.csv')}
              className="apple-btn apple-btn-primary py-3"
            >
              <Download className="h-4 w-4" /> Asset Utilization
            </button>
            <button 
              onClick={() => triggerCsvDownload('/reports/bookings?export=csv', 'bookings_report.csv')}
              className="apple-btn apple-btn-primary py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-purple-500/10"
            >
              <Download className="h-4 w-4" /> Bookings Log
            </button>
            <button 
              onClick={() => triggerCsvDownload('/reports/maintenance?export=csv', 'maintenance_report.csv')}
              className="apple-btn apple-btn-primary py-3 bg-amber-500 hover:bg-amber-600 shadow-amber-500/10"
            >
              <Download className="h-4 w-4" /> Maintenance Log
            </button>
            <button 
              onClick={() => triggerCsvDownload('/reports/audits?export=csv', 'audit_findings_report.csv')}
              className="apple-btn apple-btn-primary py-3 bg-zinc-900 hover:bg-zinc-850 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white"
            >
              <Download className="h-4 w-4" /> Audit Findings
            </button>
          </div>
        </div>

        {/* KPI Cards Grid (Asymmetric & Elevated) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="premium-card p-6 bg-gradient-to-tr from-white/90 to-[#007AFF]/5 dark:from-[#15181D] dark:to-[#007AFF]/10">
            <p className="text-[10px] font-extrabold text-[#007AFF] uppercase tracking-widest">Active Repair States</p>
            <h3 className="text-3xl font-extrabold tracking-tight mt-3 text-foreground">
              {data.kpi.assetsUnderMaintenance} <span className="text-xs font-semibold text-slate-450 dark:text-slate-500">Assets</span>
            </h3>
          </div>
          <div className="premium-card p-6">
            <p className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Pending Inquiries</p>
            <h3 className="text-3xl font-extrabold tracking-tight mt-3 text-foreground">
              {data.kpi.pendingMaintenanceRequests} <span className="text-xs font-semibold text-slate-450 dark:text-slate-500">Requests</span>
            </h3>
          </div>
          <div className="premium-card p-6 bg-gradient-to-tr from-white/90 to-amber-500/5 dark:from-[#15181D] dark:to-amber-500/10">
            <p className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest">Overdue Lifecycle Tasks</p>
            <h3 className="text-3xl font-extrabold tracking-tight mt-3 text-amber-550 dark:text-amber-400">
              {data.kpi.overdueMaintenanceCount} <span className="text-xs font-semibold text-slate-450 dark:text-slate-500">Tasks</span>
            </h3>
          </div>
          <div className="premium-card p-6 bg-gradient-to-tr from-white/90 to-red-500/5 dark:from-[#15181D] dark:to-red-500/10">
            <p className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest">Missing / Discrepant</p>
            <h3 className="text-3xl font-extrabold tracking-tight mt-3 text-red-650 dark:text-red-400">
              {data.kpi.missingAssets} <span className="text-xs font-semibold text-slate-450 dark:text-slate-500">Lost</span>
            </h3>
          </div>
        </div>

        {/* Premium SVG Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Chart 1: Assets By Status */}
          <div className="premium-card p-6">
            <h3 className="text-base font-extrabold tracking-tight mb-6 flex items-center gap-2">
              <BarChart3 className="h-4.5 w-4.5 text-slate-400" /> Catalog Allocation Matrix
            </h3>
            
            {data.charts.assetsByStatus.length === 0 ? (
              <p className="text-slate-450 text-xs text-center py-12">No registered assets.</p>
            ) : (
              <div className="space-y-4">
                {data.charts.assetsByStatus.map((item) => {
                  const percent = Math.round((item._count.id / (totalAssetsCount || 1)) * 100);
                  return (
                    <div key={item.status} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="uppercase text-[9px] tracking-wider text-slate-550 dark:text-slate-400">
                          {item.status.replace('_', ' ')}
                        </span>
                        <span className="text-[#007AFF]">{item._count.id} ({percent}%)</span>
                      </div>
                      <div className="h-5 w-full bg-slate-100/50 dark:bg-white/5 rounded-full overflow-hidden relative">
                        <div 
                          className="h-full bg-gradient-to-r from-[#007AFF] to-[#8B5CF6] rounded-full transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chart 2: Department Utilization */}
          <div className="premium-card p-6">
            <h3 className="text-base font-extrabold tracking-tight mb-6 flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-slate-400" /> Resource Deployment
            </h3>

            {data.charts.departmentUtilization.length === 0 ? (
              <p className="text-slate-450 text-xs text-center py-12">No active department allocations.</p>
            ) : (
              <div className="space-y-4">
                {data.charts.departmentUtilization.map((dept) => {
                  const maxCount = Math.max(...data.charts.departmentUtilization.map(d => d.count), 1);
                  const widthPercent = (dept.count / maxCount) * 100;
                  return (
                    <div key={dept.departmentId} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-550 dark:text-slate-400">{dept.departmentName}</span>
                        <span className="text-[#007AFF]">{dept.count} Assets</span>
                      </div>
                      <div className="h-5 w-full bg-slate-100/50 dark:bg-white/5 rounded-full overflow-hidden relative">
                        <div 
                          className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#007AFF] rounded-full transition-all duration-500" 
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chart 3: Bookings Frequency by Resource */}
          <div className="premium-card p-6">
            <h3 className="text-base font-extrabold tracking-tight mb-6 flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-slate-400" /> Reservation Loads
            </h3>
            
            {data.charts.bookingsByResource.length === 0 ? (
              <p className="text-slate-450 text-xs text-center py-12">No booking metrics recorded.</p>
            ) : (
              <div className="divide-y divide-slate-150/40 dark:divide-white/5 space-y-1">
                {data.charts.bookingsByResource.map((book, idx) => (
                  <div key={`${book.resourceType}-${idx}`} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                    <div>
                      <span className="text-xs font-bold text-foreground">{book.resourceType}</span>
                      <span className="block text-[8px] uppercase font-extrabold tracking-wider text-slate-450 mt-0.5">{book.status}</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-[#007AFF] bg-[#007AFF]/10 py-1 px-3 rounded-full border border-[#007AFF]/10">
                      {book._count.id} Bookings
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chart 4: Audit Findings Discrepancies */}
          <div className="premium-card p-6">
            <h3 className="text-base font-extrabold tracking-tight mb-6 flex items-center gap-2">
              <ClipboardCheck className="h-4.5 w-4.5 text-slate-400" /> Audit Integrity Reports
            </h3>
            
            {data.charts.auditFindings.length === 0 ? (
              <p className="text-slate-450 text-xs text-center py-12">No completed audits logged.</p>
            ) : (
              <div className="space-y-4">
                {data.charts.auditFindings.map((finding) => {
                  let colorClass = "from-emerald-500 to-teal-500";
                  if (finding.verificationStatus === "DAMAGED") colorClass = "from-amber-500 to-orange-500";
                  if (finding.verificationStatus === "MISSING") colorClass = "from-red-500 to-pink-500";

                  const maxFindingCount = Math.max(...data.charts.auditFindings.map(f => f._count.id), 1);
                  const widthPercent = (finding._count.id / maxFindingCount) * 100;

                  return (
                    <div key={finding.verificationStatus} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="uppercase text-[9px] tracking-wider text-slate-550 dark:text-slate-400">{finding.verificationStatus}</span>
                        <span className="text-foreground">{finding._count.id} items</span>
                      </div>
                      <div className="h-5 w-full bg-slate-100/50 dark:bg-white/5 rounded-full overflow-hidden relative">
                        <div 
                          className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-500`} 
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
