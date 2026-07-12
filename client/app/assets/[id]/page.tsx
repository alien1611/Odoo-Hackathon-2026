// client/app/assets/[id]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { 
  ArrowLeft, 
  Download, 
  Trash2, 
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
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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

  if (error || !asset) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-10 p-6 bg-white border border-slate-200 rounded-lg text-center shadow-sm">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Error</h3>
          <p className="text-slate-500 text-sm mb-4">{error || "Asset not found"}</p>
          <Link href="/assets" className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm font-semibold">
            Back to Assets
          </Link>
        </div>
      </Layout>
    );
  }

  const deptName = departments.find(d => d.id === asset.departmentId)?.name || "N/A";
  const catName = categories.find(c => c.id === asset.categoryId)?.name || "N/A";

  const getStatusColor = (s: string) => {
    switch (s) {
      case "AVAILABLE": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "ALLOCATED": return "bg-blue-50 text-blue-700 border-blue-200";
      case "UNDER_MAINTENANCE": return "bg-orange-50 text-orange-700 border-orange-200";
      case "LOST": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
          <Link href="/assets" className="hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Assets
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-slate-900 font-bold">{asset.assetTag}</span>
        </div>

        {/* Master Info Card */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {asset.image ? (
              <img src={asset.image} alt={asset.name} className="h-24 w-24 rounded-lg object-cover border border-slate-200 shrink-0" />
            ) : (
              <div className="h-24 w-24 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shrink-0 font-bold">
                No Image
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{asset.name}</h1>
                <span className={`px-2.5 py-0.5 rounded border text-xs font-bold ${getStatusColor(asset.status)}`}>
                  {asset.status}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-400">Tag: <span className="text-slate-700">{asset.assetTag}</span> | Serial: <span className="text-slate-700">{asset.serialNumber}</span></p>
              <p className="text-sm text-slate-500 max-w-xl">{asset.description || "No description provided."}</p>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-2.5 shrink-0 self-start md:self-auto">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-md text-xs font-bold transition-colors shadow-sm"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Specs
            </button>
            {asset.status === "ALLOCATED" && (
              <button 
                onClick={() => setIsReturnModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md text-xs font-bold transition-colors shadow-sm"
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
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Specifications</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{deptName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{catName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Physical Location</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{asset.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Condition</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs font-bold">
                      {asset.condition}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Purchase Cost</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">${Number(asset.purchaseCost).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Purchase Date</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{new Date(asset.purchaseDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vendor</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">{asset.vendor}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Warranty Expiry</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : "No warranty logged"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code and Actions Card */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex flex-col items-center justify-between text-center space-y-4">
            <h3 className="text-base font-bold text-slate-900 w-full text-left border-b border-slate-100 pb-3">Persistent QR Signature</h3>
            
            {asset.qrCode ? (
              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center">
                <img src={asset.qrCode} alt="Asset QR Code" className="h-44 w-44 object-contain bg-white rounded border border-slate-100" />
              </div>
            ) : (
              <div className="h-44 w-44 bg-slate-100 flex items-center justify-center rounded text-slate-400 text-sm font-bold border border-slate-200">
                Generating QR...
              </div>
            )}
            
            <p className="text-xs text-slate-400 font-semibold px-4">Dynamic trackable QR containing Tag, ID, and Serial Signature. Download to attach physically to the asset.</p>
            
            <button 
              onClick={handleDownloadQr}
              disabled={!asset.qrCode}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-bold transition-colors disabled:opacity-40"
            >
              <Download className="h-4 w-4" />
              Download QR Code
            </button>
          </div>
        </div>

        {/* History Timeline */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6">Asset Lifecycle Audit Trail</h3>
          
          {history.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No lifecycle events recorded for this asset.</p>
          ) : (
            <div className="flow-root">
              <ul className="-mb-8">
                {history.map((log, index) => (
                  <li key={log.id}>
                    <div className="relative pb-8">
                      {index !== history.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white ring-8 ring-white font-bold text-xs">
                            {log.action.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{log.action}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{log.description}</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-semibold">Performed by: {log.user?.name || "System"}</p>
                          </div>
                          <div className="text-right text-xs whitespace-nowrap text-slate-400 font-bold">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* MODAL: RETURN ASSET */}
        {isReturnModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-900">Return Asset</h3>
                <button onClick={() => setIsReturnModalOpen(false)} className="text-slate-400 hover:text-slate-600">Cancel</button>
              </div>
              <p className="text-sm text-slate-500 mb-4">Processing return of asset to inventory: <span className="font-semibold text-slate-800">{asset.name}</span></p>

              {actionError && <div className="p-3 mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded">{actionError}</div>}

              <form onSubmit={handleReturn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Return Condition</label>
                  <select 
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white focus:outline-none"
                  >
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="POOR">Poor</option>
                    <option value="DAMAGED">Damaged</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Remarks</label>
                  <textarea 
                    value={returnRemarks}
                    onChange={(e) => setReturnRemarks(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm h-24 resize-none focus:outline-none"
                    placeholder="Enter return comments or issues..."
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-md text-sm font-semibold">
                  Confirm Return
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT SPECIFICATIONS */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-900">Edit Asset Specifications</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">Cancel</button>
              </div>

              {actionError && <div className="p-3 mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded">{actionError}</div>}

              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Asset Name</label>
                  <input 
                    type="text" required
                    value={editedAsset.name}
                    onChange={(e) => setEditedAsset({...editedAsset, name: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                  <textarea 
                    value={editedAsset.description}
                    onChange={(e) => setEditedAsset({...editedAsset, description: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm h-20 resize-none focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                  <input 
                    type="text" required
                    value={editedAsset.location}
                    onChange={(e) => setEditedAsset({...editedAsset, location: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Condition</label>
                  <select 
                    value={editedAsset.condition}
                    onChange={(e) => setEditedAsset({...editedAsset, condition: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white focus:outline-none"
                  >
                    <option value="NEW">New</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="POOR">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Vendor</label>
                  <input 
                    type="text" required
                    value={editedAsset.vendor}
                    onChange={(e) => setEditedAsset({...editedAsset, vendor: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Purchase Cost</label>
                  <input 
                    type="number" required
                    value={editedAsset.purchaseCost || ""}
                    onChange={(e) => setEditedAsset({...editedAsset, purchaseCost: Number(e.target.value)})}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-md text-sm font-semibold">
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
