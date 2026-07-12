// client/app/assets/[id]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  Tag, 
  Building2, 
  Activity, 
  ShieldCheck, 
  MapPin, 
  DollarSign, 
  Clock,
  ChevronRight,
  Edit3,
  Undo2,
  AlertCircle,
  X
} from "lucide-react";
import Link from "next/link";

interface Asset {
  id: string;
  assetTag: string;
  serialNumber: string;
  name: string;
  description?: string;
  categoryId: string;
  departmentId: string;
  purchaseDate: string;
  purchaseCost: string;
  vendor: string;
  warrantyExpiry?: string;
  location: string;
  condition: string;
  status: string;
  qrCode?: string;
  image?: string;
}

interface HistoryItem {
  id: string;
  action: string;
  performedBy: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    email: string;
  };
}

export default function AssetDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [asset, setAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Return Asset Modal/States
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnCondition, setReturnCondition] = useState("GOOD");
  const [returnRemarks, setReturnRemarks] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedAsset, setEditedAsset] = useState({
    name: "",
    description: "",
    location: "",
    condition: "",
    vendor: "",
    purchaseCost: 0
  });

  const [departments, setDepartments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const fetchAssetDetails = async () => {
    try {
      setIsLoading(true);
      const [assetRes, historyRes, deptsRes, catsRes] = await Promise.all([
        api.get(`/assets/${id}`),
        api.get(`/assets/history/${id}`),
        api.get("/departments"),
        api.get("/categories")
      ]);

      if (assetRes.data.success) {
        setAsset(assetRes.data.data);
        setEditedAsset({
          name: assetRes.data.data.name,
          description: assetRes.data.data.description || "",
          location: assetRes.data.data.location,
          condition: assetRes.data.data.condition,
          vendor: assetRes.data.data.vendor,
          purchaseCost: Number(assetRes.data.data.purchaseCost)
        });
      }
      if (historyRes.data.success) {
        setHistory(historyRes.data.data.history);
      }
      if (deptsRes.data.success) setDepartments(deptsRes.data.data);
      if (catsRes.data.success) setCategories(catsRes.data.data);

    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load asset details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetDetails();
  }, [id]);

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionError(null);
      const response = await api.patch("/assets/return", {
        assetId: id,
        condition: returnCondition,
        remarks: returnRemarks
      });

      if (response.data.success) {
        setIsReturnModalOpen(false);
        setReturnRemarks("");
        fetchAssetDetails();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to process asset return.");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionError(null);
      const response = await api.patch(`/assets/${id}`, editedAsset);
      if (response.data.success) {
        setIsEditModalOpen(false);
        fetchAssetDetails();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to update asset.");
    }
  };

  const handleDownloadQr = () => {
    if (!asset?.qrCode) return;
    const link = document.createElement("a");
    link.href = asset.qrCode;
    link.download = `QR-${asset.assetTag}.png`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  if (error || !asset) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-12 p-8 text-center bg-white dark:bg-[#15181D] rounded-3xl shadow-2xl border border-slate-250/20 dark:border-white/5 animate-page-enter">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-extrabold text-foreground mb-2">Error</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">{error || "Asset not found"}</p>
          <Link href="/assets" className="apple-btn apple-btn-primary px-6 py-2.5">
            Back to Catalog
          </Link>
        </div>
      </Layout>
    );
  }

  const deptName = departments.find(d => d.id === asset.departmentId)?.name || "N/A";
  const catName = categories.find(c => c.id === asset.categoryId)?.name || "N/A";

  const getStatusPillClass = (s: string) => {
    switch (s) {
      case "AVAILABLE": return "status-pill-available";
      case "ALLOCATED": return "status-pill-allocated";
      case "UNDER_MAINTENANCE": return "status-pill-maintenance";
      case "LOST": return "status-pill-lost";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <Layout>
      <div className="space-y-8 animate-page-enter">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-450 dark:text-slate-500">
          <Link href="/assets" className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Assets
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{asset.assetTag}</span>
        </div>

        {/* Master Info Card */}
        <div className="premium-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            {asset.image ? (
              <img src={asset.image} alt={asset.name} className="h-20 w-20 rounded-2xl object-cover border border-slate-200/50 dark:border-white/5 shrink-0" />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-zinc-650 shrink-0 font-extrabold text-xs">
                No Image
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{asset.name}</h1>
                <span className={`status-pill ${getStatusPillClass(asset.status)}`}>
                  {asset.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs font-extrabold text-slate-450">
                Tag: <span className="text-foreground font-bold">{asset.assetTag}</span> | Serial: <span className="text-foreground font-bold">{asset.serialNumber}</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-xl font-semibold">
                {asset.description || "No device description provided."}
              </p>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-2.5 shrink-0 self-start md:self-auto w-full md:w-auto">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="apple-btn apple-btn-secondary py-2 px-4 w-full md:w-auto"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Specs
            </button>
            {asset.status === "ALLOCATED" && (
              <button 
                onClick={() => setIsReturnModalOpen(true)}
                className="apple-btn apple-btn-secondary text-[#007AFF] border-[#007AFF]/10 hover:bg-[#007AFF]/5 py-2 px-4 w-full md:w-auto"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Return Asset
              </button>
            )}
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Spec details card */}
          <div className="lg:col-span-2 premium-card p-6 space-y-6">
            <h3 className="text-base font-extrabold tracking-tight border-b border-slate-100/50 dark:border-white/5 pb-3">Device specifications</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Department</p>
                  <p className="text-xs font-bold text-foreground mt-1">{deptName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Category</p>
                  <p className="text-xs font-bold text-foreground mt-1">{catName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Physical Location</p>
                  <p className="text-xs font-bold text-foreground mt-1">{asset.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Condition</p>
                  <p className="text-xs font-bold text-foreground mt-1">
                    <span className="px-2.5 py-0.5 rounded-lg border border-slate-205 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-[10px] font-bold">
                      {asset.condition}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Purchase Cost</p>
                  <p className="text-xs font-bold text-foreground mt-1">${Number(asset.purchaseCost).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Purchase Date</p>
                  <p className="text-xs font-bold text-foreground mt-1">{new Date(asset.purchaseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Vendor</p>
                  <p className="text-xs font-bold text-foreground mt-1">{asset.vendor}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Warranty Expiry</p>
                  <p className="text-xs font-bold text-foreground mt-1">
                    {asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "No warranty logged"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code and Actions Card */}
          <div className="premium-card p-6 flex flex-col items-center justify-between text-center min-h-[360px]">
            <h3 className="text-base font-extrabold tracking-tight w-full text-left border-b border-slate-100/50 dark:border-white/5 pb-3">QR Label</h3>
            
            {asset.qrCode ? (
              <div className="p-3.5 border border-slate-200/50 dark:border-white/5 rounded-2xl bg-slate-50/50 dark:bg-white/5 flex items-center justify-center my-4">
                <img src={asset.qrCode} alt="Asset QR Code" className="h-40 w-40 object-contain bg-white rounded-xl border border-slate-100" />
              </div>
            ) : (
              <div className="h-40 w-40 bg-slate-150/40 dark:bg-white/5 flex items-center justify-center rounded-2xl text-slate-400 text-xs font-bold border border-slate-200/10 my-4">
                Generating QR...
              </div>
            )}
            
            <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold px-2 mb-4 leading-relaxed">Dynamic signature containing verification links. Attach to physical hardware to trace logs.</p>
            
            <button 
              onClick={handleDownloadQr}
              disabled={!asset.qrCode}
              className="w-full apple-btn apple-btn-primary py-3"
            >
              <Download className="h-4 w-4" />
              Download QR Label
            </button>
          </div>
        </div>

        {/* History Timeline */}
        <div className="premium-card p-6">
          <h3 className="text-base font-extrabold tracking-tight border-b border-slate-100/50 dark:border-white/5 pb-3 mb-6">Device Chronology</h3>
          
          {history.length === 0 ? (
            <p className="text-slate-450 text-xs text-center py-8 italic font-semibold">No lifecycle event logs found.</p>
          ) : (
            <div className="space-y-1 pl-1">
              {history.map((log) => (
                <div key={log.id} className="timeline-item">
                  <span className="timeline-dot" />
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-xs font-bold text-foreground">{log.action}</p>
                      <p className="text-xs text-slate-550 dark:text-slate-400 font-semibold mt-1 leading-relaxed">{log.description}</p>
                      <p className="text-[9px] text-slate-450 uppercase font-extrabold tracking-wider mt-1.5">BY: {log.user?.name || "System"}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL: RETURN ASSET */}
        {isReturnModalOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/40 backdrop-blur-md animate-page-enter">
            <div className="bg-white dark:bg-[#15181D] border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-2xl w-full max-w-md p-6 relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="window-dot dot-close" />
                    <span className="window-dot dot-minimize" />
                    <span className="window-dot dot-maximize" />
                  </div>
                  <h3 className="text-lg font-extrabold text-foreground">Return Asset</h3>
                </div>
                <button 
                  onClick={() => setIsReturnModalOpen(false)} 
                  className="p-2 text-slate-450 hover:text-foreground rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-slate-550 mb-6 font-semibold">Returning to inventory: <span className="text-foreground font-extrabold">{asset.name}</span></p>

              {actionError && (
                <div className="p-3 mb-4 text-xs text-red-650 bg-red-500/10 border border-red-500/15 rounded-2xl font-bold flex items-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
                  {actionError}
                </div>
              )}

              <form onSubmit={handleReturn} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Return Condition</label>
                  <select 
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value)}
                    className="glass-input bg-white/95 dark:bg-[#15181D]/95"
                  >
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="POOR">Poor</option>
                    <option value="DAMAGED">Damaged</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Remarks</label>
                  <textarea 
                    value={returnRemarks}
                    onChange={(e) => setReturnRemarks(e.target.value)}
                    className="glass-input h-24 resize-none"
                    placeholder="Enter return comments or issues..."
                  />
                </div>
                <button type="submit" className="w-full apple-btn apple-btn-primary py-3">
                  Confirm Return
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT SPECIFICATIONS */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/40 backdrop-blur-md animate-page-enter">
            <div className="bg-white dark:bg-[#15181D] border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-2xl w-full max-w-md p-6 relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="window-dot dot-close" />
                    <span className="window-dot dot-minimize" />
                    <span className="window-dot dot-maximize" />
                  </div>
                  <h3 className="text-lg font-extrabold text-foreground">Edit Asset Specs</h3>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="p-2 text-slate-455 hover:text-foreground rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {actionError && (
                <div className="p-3 mb-4 text-xs text-red-650 bg-red-500/10 border border-red-500/15 rounded-2xl font-bold flex items-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
                  {actionError}
                </div>
              )}

              <form onSubmit={handleEdit} className="space-y-5 overflow-y-auto max-h-[65vh] pr-1">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-455 dark:text-slate-500 uppercase tracking-wider pl-1">Asset Name</label>
                  <input 
                    type="text" required
                    value={editedAsset.name}
                    onChange={(e) => setEditedAsset({...editedAsset, name: e.target.value})}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-455 dark:text-slate-500 uppercase tracking-wider pl-1">Description</label>
                  <textarea 
                    value={editedAsset.description}
                    onChange={(e) => setEditedAsset({...editedAsset, description: e.target.value})}
                    className="glass-input h-20 resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-455 dark:text-slate-500 uppercase tracking-wider pl-1">Location</label>
                  <input 
                    type="text" required
                    value={editedAsset.location}
                    onChange={(e) => setEditedAsset({...editedAsset, location: e.target.value})}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-455 dark:text-slate-500 uppercase tracking-wider pl-1">Condition</label>
                  <select 
                    value={editedAsset.condition}
                    onChange={(e) => setEditedAsset({...editedAsset, condition: e.target.value})}
                    className="glass-input bg-white/95 dark:bg-[#15181D]/95"
                  >
                    <option value="NEW">New</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="POOR">Poor</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-455 dark:text-slate-500 uppercase tracking-wider pl-1">Vendor</label>
                  <input 
                    type="text" required
                    value={editedAsset.vendor}
                    onChange={(e) => setEditedAsset({...editedAsset, vendor: e.target.value})}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-455 dark:text-slate-500 uppercase tracking-wider pl-1">Purchase Cost</label>
                  <input 
                    type="number" required
                    value={editedAsset.purchaseCost || ""}
                    onChange={(e) => setEditedAsset({...editedAsset, purchaseCost: Number(e.target.value)})}
                    className="glass-input"
                  />
                </div>
                <button type="submit" className="w-full apple-btn apple-btn-primary py-3">
                  Save Specifications
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
