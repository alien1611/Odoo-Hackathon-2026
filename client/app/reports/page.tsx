// client/app/reports/page.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { 
  Download, 
  BarChart3, 
  PieChart, 
  Calendar, 
  Wrench, 
  ClipboardCheck, 
  AlertTriangle,
  TrendingUp,
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
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 bg-slate-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-white border border-slate-200 rounded-lg p-5"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-96 bg-white border border-slate-200 rounded-lg"></div>
            <div className="h-96 bg-white border border-slate-200 rounded-lg"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-10 p-6 bg-white border border-slate-200 rounded-lg text-center shadow-sm">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Error</h3>
          <p className="text-slate-500 text-sm mb-4">{error || "An error occurred loading reports."}</p>
          <button 
            onClick={fetchReportsData}
            className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm font-semibold"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  // Aggregate stats for calculations
  const totalAssetsCount = data.charts.assetsByStatus.reduce((sum, item) => sum + item._count.id, 0);

  // SVG Chart Computations (Responsive Dimensions)
  const chartHeight = 160;
  const chartWidth = 320;
  const barPadding = 12;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & System Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Review organizational metrics, asset utilization, and download CSV/Excel audit logs.</p>
        </div>

        {/* Export Toolbar panel */}
        <div className="bg-white p-5 border border-slate-200 rounded-lg shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-400">
            <Download className="h-4.5 w-4.5 text-slate-400" /> Export Logs
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => triggerCsvDownload('/reports/assets?export=csv', 'asset_utilization_report.csv')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md text-xs shadow-sm transition-all"
            >
              <Download className="h-4 w-4" /> Asset Utilization
            </button>
            <button 
              onClick={() => triggerCsvDownload('/reports/bookings?export=csv', 'bookings_report.csv')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md text-xs shadow-sm transition-all"
            >
              <Download className="h-4 w-4" /> Bookings Report
            </button>
            <button 
              onClick={() => triggerCsvDownload('/reports/maintenance?export=csv', 'maintenance_report.csv')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md text-xs shadow-sm transition-all"
            >
              <Download className="h-4 w-4" /> Maintenance Report
            </button>
            <button 
              onClick={() => triggerCsvDownload('/reports/audits?export=csv', 'audit_findings_report.csv')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md text-xs shadow-sm transition-all"
            >
              <Download className="h-4 w-4" /> Audit Findings Log
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Under Maintenance</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{data.kpi.assetsUnderMaintenance} Assets</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Repairs</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{data.kpi.pendingMaintenanceRequests} Requests</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overdue Maintenance</p>
            <h3 className="text-2xl font-bold text-orange-600 mt-2">{data.kpi.overdueMaintenanceCount} Tasks</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Missing Assets</p>
            <h3 className="text-2xl font-bold text-red-600 mt-2">{data.kpi.missingAssets} Lost</h3>
          </div>
        </div>

        {/* Premium SVG Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart 1: Assets By Status (SVG Bar Chart) */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-400" /> Assets Status Distribution
            </h3>
            
            {data.charts.assetsByStatus.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-10">No assets registered.</p>
            ) : (
              <div className="space-y-4">
                {data.charts.assetsByStatus.map((item) => {
                  const percent = Math.round((item._count.id / (totalAssetsCount || 1)) * 100);
                  return (
                    <div key={item.status} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span className="font-bold uppercase">{item.status.replace('_', ' ')}</span>
                        <span>{item._count.id} ({percent}%)</span>
                      </div>
                      <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-950 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chart 2: Department Utilization (SVG Bar Chart) */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-slate-400" /> Assets by Department
            </h3>

            {data.charts.departmentUtilization.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-10">No department data.</p>
            ) : (
              <div className="space-y-4">
                {data.charts.departmentUtilization.map((dept) => {
                  const maxCount = Math.max(...data.charts.departmentUtilization.map(d => d.count), 1);
                  const widthPercent = (dept.count / maxCount) * 100;
                  return (
                    <div key={dept.departmentId} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>{dept.departmentName}</span>
                        <span className="font-bold">{dept.count} Assets</span>
                      </div>
                      <div className="h-4 bg-slate-100 rounded overflow-hidden">
                        <div className="h-full bg-slate-900 rounded" style={{ width: `${widthPercent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chart 3: Bookings Frequency by Resource (SVG Pie list representation) */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-400" /> Bookings Frequency
            </h3>
            
            {data.charts.bookingsByResource.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-10">No bookings recorded.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.charts.bookingsByResource.map((book, idx) => (
                  <div key={`${book.resourceType}-${idx}`} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                    <span className="text-sm font-bold text-slate-800">{book.resourceType} ({book.status})</span>
                    <span className="text-sm font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      {book._count.id} Bookings
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chart 4: Audit Findings Discrepancies */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-slate-400" /> Audit Findings & Discrepancies
            </h3>
            
            {data.charts.auditFindings.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-10">No audit records logged.</p>
            ) : (
              <div className="space-y-4">
                {data.charts.auditFindings.map((finding) => {
                  let colorClass = "bg-emerald-500";
                  if (finding.verificationStatus === "DAMAGED") colorClass = "bg-amber-500";
                  if (finding.verificationStatus === "MISSING") colorClass = "bg-rose-500";

                  const maxFindingCount = Math.max(...data.charts.auditFindings.map(f => f._count.id), 1);
                  const widthPercent = (finding._count.id / maxFindingCount) * 100;

                  return (
                    <div key={finding.verificationStatus} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-650">
                        <span className="font-bold">{finding.verificationStatus}</span>
                        <span>{finding._count.id} Assets</span>
                      </div>
                      <div className="h-4 bg-slate-100 rounded overflow-hidden">
                        <div className={`h-full rounded ${colorClass}`} style={{ width: `${widthPercent}%` }} />
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
