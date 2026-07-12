// client/app/assets/page.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { 
  Plus, 
  Search, 
  Filter, 
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
  AlertCircle
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "ALLOCATED": return "bg-blue-50 text-blue-700 border-blue-200";
      case "RESERVED": return "bg-amber-50 text-amber-700 border-amber-200";
      case "UNDER_MAINTENANCE": return "bg-orange-50 text-orange-700 border-orange-200";
      case "LOST": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Asset Management</h1>
            <p className="text-sm text-slate-500 mt-1">Track and manage lifecycle, allocations, and transfers of enterprise assets.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors text-sm font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Asset
          </button>
        </div>

        {/* Search & Filter Matrix */}
        <div className="bg-white p-5 border border-slate-200 rounded-lg shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by Asset Tag, Serial Number, Name, Location or Vendor..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-wrap gap-3">
              {/* Status Filter */}
              <select 
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:outline-none"
              >
                <option value="">All Statuses</option>
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
                className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:outline-none"
              >
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              {/* Category Filter */}
              <select 
                value={catFilter}
                onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
              Loading assets...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 bg-red-50 flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          ) : assets.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              No assets registered matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Asset Tag</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Condition</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                        {asset.assetTag}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div>
                          <div className="font-semibold text-slate-900">{asset.name}</div>
                          <div className="text-xs text-slate-400">SN: {asset.serialNumber}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-semibold">
                        {asset.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2.5 py-0.5 rounded border border-slate-200 text-xs font-semibold text-slate-600">
                          {asset.condition}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2.5 py-0.5 rounded border text-xs font-bold ${getStatusBadgeClass(asset.status)}`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link 
                          href={`/assets/${asset.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors font-bold"
                        >
                          <Info className="h-3 w-3" />
                          Details
                        </Link>
                        {asset.status === "AVAILABLE" && (
                          <button
                            onClick={() => { setSelectedAsset(asset); setIsAllocateModalOpen(true); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors font-bold"
                          >
                            <UserCheck className="h-3 w-3" />
                            Allocate
                          </button>
                        )}
                        {["AVAILABLE", "ALLOCATED"].includes(asset.status) && (
                          <button
                            onClick={() => { setSelectedAsset(asset); setIsTransferModalOpen(true); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors font-bold"
                          >
                            <ArrowRightLeft className="h-3 w-3" />
                            Transfer
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          disabled={asset.status === "ALLOCATED"}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:hover:bg-transparent rounded transition-colors font-bold"
                        >
                          <Trash2 className="h-3 w-3" />
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
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{assets.length}</span> of <span className="font-bold text-slate-800">{total}</span> assets
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2 border border-slate-300 bg-white hover:bg-slate-100 rounded-md disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => (p * limit < total ? p + 1 : p))}
                disabled={page * limit >= total}
                className="p-2 border border-slate-300 bg-white hover:bg-slate-100 rounded-md disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* MODAL 1: ALLOCATE ASSET */}
        {isAllocateModalOpen && selectedAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-900">Allocate Asset</h3>
                <button onClick={() => setIsAllocateModalOpen(false)} className="text-slate-400 hover:text-slate-600">Cancel</button>
              </div>
              <p className="text-sm text-slate-500 mb-4">Allocating asset: <span className="font-semibold text-slate-800">{selectedAsset.name} ({selectedAsset.assetTag})</span></p>

              {modalError && <div className="p-3 mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded">{modalError}</div>}

              <form onSubmit={handleAllocate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Employee ID (UUID)</label>
                  <input 
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Expected Return Date</label>
                  <input 
                    type="date"
                    required
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Remarks</label>
                  <textarea 
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm h-20 resize-none focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    placeholder="Provide additional details..."
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-md text-sm font-semibold">
                  Confirm Allocation
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: REQUEST TRANSFER */}
        {isTransferModalOpen && selectedAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-900">Request Asset Transfer</h3>
                <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600">Cancel</button>
              </div>
              <p className="text-sm text-slate-500 mb-4">Transferring: <span className="font-semibold text-slate-800">{selectedAsset.name} ({selectedAsset.assetTag})</span></p>

              {modalError && <div className="p-3 mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded">{modalError}</div>}

              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Target Department</label>
                  <select 
                    required
                    value={toDepartment}
                    onChange={(e) => setToDepartment(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
                  >
                    <option value="">Select Target Department...</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Transfer Reason</label>
                  <textarea 
                    required
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm h-24 resize-none focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    placeholder="Why is this transfer necessary? Minimum 5 characters..."
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-md text-sm font-semibold">
                  Submit Transfer Request
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: ADD ASSET */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-2xl p-6 my-8">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-900">Add Enterprise Asset</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">Cancel</button>
              </div>

              {modalError && <div className="p-3 mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded">{modalError}</div>}

              <form onSubmit={handleCreateAsset} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Asset Tag</label>
                    <input 
                      type="text" required placeholder="e.g. AST-LAP-009"
                      value={newAsset.assetTag}
                      onChange={(e) => setNewAsset({...newAsset, assetTag: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Serial Number</label>
                    <input 
                      type="text" required placeholder="e.g. SN-88371628A"
                      value={newAsset.serialNumber}
                      onChange={(e) => setNewAsset({...newAsset, serialNumber: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Asset Name</label>
                    <input 
                      type="text" required placeholder="e.g. Macbook Pro 16"
                      value={newAsset.name}
                      onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                    <select 
                      required
                      value={newAsset.categoryId}
                      onChange={(e) => setNewAsset({...newAsset, categoryId: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                    >
                      <option value="">Select Category...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Department</label>
                    <select 
                      required
                      value={newAsset.departmentId}
                      onChange={(e) => setNewAsset({...newAsset, departmentId: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                    >
                      <option value="">Select Department...</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Purchase Date</label>
                    <input 
                      type="date" required
                      value={newAsset.purchaseDate}
                      onChange={(e) => setNewAsset({...newAsset, purchaseDate: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Purchase Cost (USD)</label>
                    <input 
                      type="number" required placeholder="2400"
                      value={newAsset.purchaseCost || ""}
                      onChange={(e) => setNewAsset({...newAsset, purchaseCost: Number(e.target.value)})}
                      className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Vendor</label>
                    <input 
                      type="text" required placeholder="Apple Store"
                      value={newAsset.vendor}
                      onChange={(e) => setNewAsset({...newAsset, vendor: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Warranty Expiry</label>
                    <input 
                      type="date"
                      value={newAsset.warrantyExpiry}
                      onChange={(e) => setNewAsset({...newAsset, warrantyExpiry: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Physical Location</label>
                    <input 
                      type="text" required placeholder="Headquarters Room 4A"
                      value={newAsset.location}
                      onChange={(e) => setNewAsset({...newAsset, location: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Condition</label>
                    <select
                      value={newAsset.condition}
                      onChange={(e) => setNewAsset({...newAsset, condition: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                    >
                      <option value="NEW">New</option>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                      <option value="POOR">Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Image URL</label>
                    <input 
                      type="text" placeholder="https://example.com/laptop.jpg"
                      value={newAsset.image}
                      onChange={(e) => setNewAsset({...newAsset, image: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-md text-sm font-semibold transition-colors mt-2 shadow-sm">
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
