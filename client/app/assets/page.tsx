// client/app/assets/page.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { 
  Plus, 
  Search, 
  Tag, 
  Building2, 
  Info, 
  Calendar, 
  Trash2, 
  UserCheck, 
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
  X,
  Package
} from "lucide-react";
import Link from "next/link";

interface Asset {
  id: string;
  assetTag: string;
  serialNumber: string;
  name: string;
  categoryId: string;
  departmentId: string;
  location: string;
  condition: string;
  status: string;
  purchaseCost: string;
  purchaseDate: string;
  qrCode?: string;
  image?: string;
}

interface Department {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  
  // Modals
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Form states
  const [employeeId, setEmployeeId] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [remarks, setRemarks] = useState("");
  
  const [toDepartment, setToDepartment] = useState("");
  const [transferReason, setTransferReason] = useState("");

  const [newAsset, setNewAsset] = useState({
    assetTag: "",
    serialNumber: "",
    name: "",
    categoryId: "",
    departmentId: "",
    purchaseDate: "",
    purchaseCost: 0,
    vendor: "",
    warrantyExpiry: "",
    location: "",
    condition: "NEW",
    image: ""
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        status: statusFilter,
        departmentId: deptFilter,
        categoryId: catFilter,
        condition: conditionFilter
      });

      const response = await api.get(`/assets?${queryParams.toString()}`);
      if (response.data.success) {
        setAssets(response.data.data.assets);
        setTotal(response.data.data.total);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load assets.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFiltersData = async () => {
    try {
      const [deptsRes, catsRes] = await Promise.all([
        api.get("/departments"),
        api.get("/categories")
      ]);
      if (deptsRes.data.success) setDepartments(deptsRes.data.data);
      if (catsRes.data.success) setCategories(catsRes.data.data);
    } catch (err) {
      console.error("Failed to fetch categories/departments", err);
    }
  };

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [page, search, statusFilter, deptFilter, catFilter, conditionFilter]);

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    try {
      setModalError(null);
      const response = await api.post("/assets/allocate", {
        assetId: selectedAsset.id,
        employeeId,
        expectedReturnDate,
        remarks
      });
      if (response.data.success) {
        setIsAllocateModalOpen(false);
        resetFormStates();
        fetchAssets();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || "Failed to allocate asset.");
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    try {
      setModalError(null);
      const response = await api.post("/assets/transfer", {
        assetId: selectedAsset.id,
        toDepartment,
        reason: transferReason
      });
      if (response.data.success) {
        setIsTransferModalOpen(false);
        resetFormStates();
        fetchAssets();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || "Failed to request transfer.");
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setModalError(null);
      const response = await api.post("/assets", {
        ...newAsset,
        purchaseCost: Number(newAsset.purchaseCost)
      });
      if (response.data.success) {
        setIsAddModalOpen(false);
        resetFormStates();
        fetchAssets();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || "Failed to create asset.");
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm("Are you sure you want to decommission (soft-delete) this asset?")) return;
    try {
      const response = await api.delete(`/assets/${id}`);
      if (response.data.success) {
        fetchAssets();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete asset.");
    }
  };

  const resetFormStates = () => {
    setSelectedAsset(null);
    setEmployeeId("");
    setExpectedReturnDate("");
    setRemarks("");
    setToDepartment("");
    setTransferReason("");
    setNewAsset({
      assetTag: "",
      serialNumber: "",
      name: "",
      categoryId: "",
      departmentId: "",
      purchaseDate: "",
      purchaseCost: 0,
      vendor: "",
      warrantyExpiry: "",
      location: "",
      condition: "NEW",
      image: ""
    });
    setModalError(null);
  };

  const getStatusPillClass = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "status-pill-available";
      case "ALLOCATED": return "status-pill-allocated";
      case "RESERVED": return "status-pill-reserved";
      case "UNDER_MAINTENANCE": return "status-pill-maintenance";
      case "LOST": return "status-pill-lost";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <Layout>
      <div className="space-y-8 animate-page-enter">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Asset Catalog</h1>
            <p className="text-xs text-slate-450 dark:text-slate-450 mt-1">Lifecycle control, allocation logs, and department transfers.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="apple-btn apple-btn-primary"
          >
            <Plus className="h-4 w-4" />
            Add Asset
          </button>
        </div>

        {/* Search & Filter Matrix */}
        <div className="glass-panel p-5 bg-white/50 dark:bg-[#15181D]/45 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search asset tags, names, serial numbers, locations..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="glass-input pl-10"
              />
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-wrap gap-3">
              {/* Status Filter */}
              <select 
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="glass-input py-2 px-3 bg-white/70 dark:bg-[#15181D]/70 max-w-[150px]"
              >
                <option value="">Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="ALLOCATED">Allocated</option>
                <option value="RESERVED">Reserved</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                <option value="LOST">Lost</option>
                <option value="DISPOSED">Disposed</option>
              </select>

              {/* Department Filter */}
              <select 
                value={deptFilter}
                onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
                className="glass-input py-2 px-3 bg-white/70 dark:bg-[#15181D]/70 max-w-[150px]"
              >
                <option value="">Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              {/* Category Filter */}
              <select 
                value={catFilter}
                onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
                className="glass-input py-2 px-3 bg-white/70 dark:bg-[#15181D]/70 max-w-[150px]"
              >
                <option value="">Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="luxury-table-container">
          {isLoading ? (
            <div className="p-16 text-center text-slate-450">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
              Refreshing catalog...
            </div>
          ) : error ? (
            <div className="p-16 text-center text-red-650 bg-red-500/5 flex flex-col items-center justify-center gap-2">
              <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
              <p className="font-extrabold text-sm">{error}</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center justify-center">
              <Package className="h-12 w-12 text-slate-350 dark:text-zinc-700 mb-3" />
              <p className="text-sm font-extrabold text-slate-500">No assets found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px]">Try relaxing your search terms or filters above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="luxury-table">
                <thead>
                  <tr>
                    <th>Asset Tag</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Condition</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id}>
                      <td className="font-extrabold text-foreground">
                        {asset.assetTag}
                      </td>
                      <td>
                        <div>
                          <div className="font-bold text-foreground">{asset.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">SN: {asset.serialNumber}</div>
                        </div>
                      </td>
                      <td className="font-semibold text-slate-500 dark:text-slate-400">
                        {asset.location}
                      </td>
                      <td>
                        <span className="px-2.5 py-0.5 rounded-lg border border-slate-200/50 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {asset.condition}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${getStatusPillClass(asset.status)}`}>
                          {asset.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="text-right space-x-1.5 whitespace-nowrap">
                        <Link 
                          href={`/assets/${asset.id}`}
                          className="apple-btn apple-btn-secondary py-1.5 px-3"
                        >
                          <Info className="h-3.5 w-3.5" />
                          Details
                        </Link>
                        {asset.status === "AVAILABLE" && (
                          <button
                            onClick={() => { setSelectedAsset(asset); setIsAllocateModalOpen(true); }}
                            className="apple-btn apple-btn-primary py-1.5 px-3"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            Allocate
                          </button>
                        )}
                        {["AVAILABLE", "ALLOCATED"].includes(asset.status) && (
                          <button
                            onClick={() => { setSelectedAsset(asset); setIsTransferModalOpen(true); }}
                            className="apple-btn apple-btn-secondary py-1.5 px-3 text-amber-500 border-amber-500/10 hover:bg-amber-500/5"
                          >
                            <ArrowRightLeft className="h-3.5 w-3.5" />
                            Transfer
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          disabled={asset.status === "ALLOCATED"}
                          className="apple-btn apple-btn-secondary py-1.5 px-3 text-red-500 border-red-500/10 hover:bg-red-500/5 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Decommission
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Matrix */}
          <div className="bg-slate-50/50 dark:bg-[#15181D]/30 border-t border-slate-200/20 dark:border-white/5 px-6 py-4 flex items-center justify-between">
            <div className="text-xs text-slate-450 dark:text-slate-450 font-bold">
              Showing <span className="text-foreground">{assets.length}</span> of <span className="text-foreground">{total}</span> items
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="apple-btn apple-btn-secondary p-2 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => (p * limit < total ? p + 1 : p))}
                disabled={page * limit >= total}
                className="apple-btn apple-btn-secondary p-2 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* MODAL 1: ALLOCATE ASSET */}
        {isAllocateModalOpen && selectedAsset && (
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
                  <h3 className="text-lg font-extrabold text-foreground">Allocate Asset</h3>
                </div>
                <button 
                  onClick={() => setIsAllocateModalOpen(false)} 
                  className="p-1 text-slate-400 hover:text-foreground rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <p className="text-xs text-slate-500 mb-6 font-semibold">
                Resource: <span className="text-foreground font-extrabold">{selectedAsset.name} ({selectedAsset.assetTag})</span>
              </p>

              {modalError && (
                <div className="p-3 mb-4 text-xs text-red-650 bg-red-500/10 border border-red-500/15 rounded-2xl font-bold flex items-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
                  {modalError}
                </div>
              )}

              <form onSubmit={handleAllocate} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Employee ID (UUID)</label>
                  <input 
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                    className="glass-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Expected Return Date</label>
                  <input 
                    type="date"
                    required
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Remarks</label>
                  <textarea 
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="glass-input h-20 resize-none"
                    placeholder="Provide additional details..."
                  />
                </div>
                <button type="submit" className="w-full apple-btn apple-btn-primary py-3">
                  Confirm Allocation
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: REQUEST TRANSFER */}
        {isTransferModalOpen && selectedAsset && (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/40 backdrop-blur-md animate-page-enter">
            <div className="bg-white dark:bg-[#15181D] border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-2xl w-full max-w-md p-6 relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="window-dot dot-close" />
                    <span className="window-dot dot-minimize" />
                    <span className="window-dot dot-maximize" />
                  </div>
                  <h3 className="text-lg font-extrabold text-foreground">Request Asset Transfer</h3>
                </div>
                <button 
                  onClick={() => setIsTransferModalOpen(false)} 
                  className="p-1 text-slate-400 hover:text-foreground rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-6 font-semibold">
                Resource: <span className="text-foreground font-extrabold">{selectedAsset.name} ({selectedAsset.assetTag})</span>
              </p>

              {modalError && (
                <div className="p-3 mb-4 text-xs text-red-650 bg-red-500/10 border border-red-500/15 rounded-2xl font-bold flex items-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
                  {modalError}
                </div>
              )}

              <form onSubmit={handleTransfer} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Target Department</label>
                  <select 
                    required
                    value={toDepartment}
                    onChange={(e) => setToDepartment(e.target.value)}
                    className="glass-input bg-white/95 dark:bg-[#15181D]/95"
                  >
                    <option value="">Select Target Department...</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Transfer Reason</label>
                  <textarea 
                    required
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    className="glass-input h-24 resize-none"
                    placeholder="Why is this transfer necessary? Minimum 5 characters..."
                  />
                </div>
                <button type="submit" className="w-full apple-btn apple-btn-primary py-3">
                  Submit Transfer Request
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: ADD ASSET */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/40 backdrop-blur-md overflow-y-auto animate-page-enter">
            <div className="bg-white dark:bg-[#15181D] border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-2xl w-full max-w-2xl p-6 my-8 relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="window-dot dot-close" />
                    <span className="window-dot dot-minimize" />
                    <span className="window-dot dot-maximize" />
                  </div>
                  <h3 className="text-lg font-extrabold text-foreground">Register Asset</h3>
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
                  <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
                  {modalError}
                </div>
              )}

              <form onSubmit={handleCreateAsset} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Asset Tag</label>
                    <input 
                      type="text" required placeholder="e.g. AST-LAP-009"
                      value={newAsset.assetTag}
                      onChange={(e) => setNewAsset({...newAsset, assetTag: e.target.value})}
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Serial Number</label>
                    <input 
                      type="text" required placeholder="e.g. SN-88371628A"
                      value={newAsset.serialNumber}
                      onChange={(e) => setNewAsset({...newAsset, serialNumber: e.target.value})}
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Asset Name</label>
                    <input 
                      type="text" required placeholder="e.g. Macbook Pro 16"
                      value={newAsset.name}
                      onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Category</label>
                    <select 
                      required
                      value={newAsset.categoryId}
                      onChange={(e) => setNewAsset({...newAsset, categoryId: e.target.value})}
                      className="glass-input bg-white/95 dark:bg-[#15181D]/95"
                    >
                      <option value="">Select Category...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Department</label>
                    <select 
                      required
                      value={newAsset.departmentId}
                      onChange={(e) => setNewAsset({...newAsset, departmentId: e.target.value})}
                      className="glass-input bg-white/95 dark:bg-[#15181D]/95"
                    >
                      <option value="">Select Department...</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Purchase Date</label>
                    <input 
                      type="date" required
                      value={newAsset.purchaseDate}
                      onChange={(e) => setNewAsset({...newAsset, purchaseDate: e.target.value})}
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Purchase Cost (USD)</label>
                    <input 
                      type="number" required placeholder="2400"
                      value={newAsset.purchaseCost || ""}
                      onChange={(e) => setNewAsset({...newAsset, purchaseCost: Number(e.target.value)})}
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Vendor</label>
                    <input 
                      type="text" required placeholder="Apple Store"
                      value={newAsset.vendor}
                      onChange={(e) => setNewAsset({...newAsset, vendor: e.target.value})}
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Warranty Expiry</label>
                    <input 
                      type="date"
                      value={newAsset.warrantyExpiry}
                      onChange={(e) => setNewAsset({...newAsset, warrantyExpiry: e.target.value})}
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Physical Location</label>
                    <input 
                      type="text" required placeholder="Headquarters Room 4A"
                      value={newAsset.location}
                      onChange={(e) => setNewAsset({...newAsset, location: e.target.value})}
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Condition</label>
                    <select
                      value={newAsset.condition}
                      onChange={(e) => setNewAsset({...newAsset, condition: e.target.value})}
                      className="glass-input bg-white/95 dark:bg-[#15181D]/95"
                    >
                      <option value="NEW">New</option>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                      <option value="POOR">Poor</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">Image URL</label>
                    <input 
                      type="text" placeholder="https://example.com/laptop.jpg"
                      value={newAsset.image}
                      onChange={(e) => setNewAsset({...newAsset, image: e.target.value})}
                      className="glass-input"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full apple-btn apple-btn-primary py-3">
                  Register Asset & Generate QR Code
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
