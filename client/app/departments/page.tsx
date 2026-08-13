// client/app/departments/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { 
  Building2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  User, 
  Loader2,
  Users,
  Package,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  Sparkles,
  ArrowUpDown
} from "lucide-react";
import Link from "next/link";

interface Employee {
  id: string;
  name: string;
  email: string;
  designation?: string | null;
  role?: string;
  status?: string;
}

interface AssetSummary {
  id: string;
  assetTag: string;
  name: string;
  status: string;
  purchaseCost: string | number;
  location?: string;
}

interface Department {
  id: string;
  name: string;
  description: string | null;
  headId: string | null;
  status: string;
  createdAt: string;
  head: Employee | null;
  _count?: {
    employees: number;
    assets: number;
  };
  employees?: Employee[];
  assets?: AssetSummary[];
}

interface DepartmentStats {
  totalDepartments: number;
  activeDepartments: number;
  inactiveDepartments: number;
  totalEmployees: number;
  totalAssets: number;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [stats, setStats] = useState<DepartmentStats | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [viewingDept, setViewingDept] = useState<Department | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    headId: "",
    status: "ACTIVE"
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [headFilter, setHeadFilter] = useState<"ALL" | "ASSIGNED" | "UNASSIGNED">("ALL");
  const [sortBy, setSortBy] = useState<"name" | "employees" | "assets">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const [deptRes, statsRes] = await Promise.all([
        api.get("/departments"),
        api.get("/departments/stats").catch(() => null)
      ]);

      if (deptRes.data.success) {
        setDepartments(deptRes.data.data);
      }
      if (statsRes?.data?.success) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      setError("Failed to fetch corporate departments directory.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/users?limit=100");
      if (response.data.success) {
        setEmployees(response.data.data.users || []);
      }
    } catch (err) {
      console.error("Failed to load personnel roster for assignment:", err);
    }
  };

  const fetchDepartmentDetail = async (id: string) => {
    try {
      setIsDetailLoading(true);
      const response = await api.get(`/departments/${id}`);
      if (response.data.success) {
        setViewingDept(response.data.data);
      }
    } catch (err) {
      console.error("Failed to load department details:", err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUserRole(user.role);
    }

    fetchDepartments();
    fetchEmployees();
  }, []);

  const openCreateModal = () => {
    setEditingDept(null);
    setFormData({ name: "", description: "", headId: "", status: "ACTIVE" });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description || "",
      headId: dept.headId || "",
      status: dept.status
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Department name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        headId: formData.headId || null,
        status: formData.status
      };

      let response;
      if (editingDept) {
        response = await api.patch(`/departments/${editingDept.id}`, payload);
      } else {
        response = await api.post("/departments", payload);
      }

      if (response.data.success) {
        setIsModalOpen(false);
        fetchDepartments();
      }
    } catch (err) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setFormError(errorResponse.response?.data?.message || "Failed to save corporate department.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete '${name}'? This action cannot be undone.`)) return;
    try {
      const response = await api.delete(`/departments/${id}`);
      if (response.data.success) {
        if (viewingDept?.id === id) setViewingDept(null);
        fetchDepartments();
      }
    } catch (err) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      alert(errorResponse.response?.data?.message || "Cannot delete department: Ensure no active staff or assets remain assigned.");
      console.error(err);
    }
  };

  // Filter and sort logic
  const filteredAndSortedDepts = useMemo(() => {
    return departments
      .filter((dept) => {
        const matchesSearch = 
          dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (dept.description && dept.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (dept.head?.name && dept.head.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (dept.head?.email && dept.head.email.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = 
          statusFilter === "ALL" ? true : dept.status === statusFilter;

        const matchesHead = 
          headFilter === "ALL" 
            ? true 
            : headFilter === "ASSIGNED" 
              ? Boolean(dept.headId) 
              : !dept.headId;

        return matchesSearch && matchesStatus && matchesHead;
      })
      .sort((a, b) => {
        let valA: string | number = "";
        let valB: string | number = "";

        if (sortBy === "name") {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (sortBy === "employees") {
          valA = a._count?.employees || 0;
          valB = b._count?.employees || 0;
        } else if (sortBy === "assets") {
          valA = a._count?.assets || 0;
          valB = b._count?.assets || 0;
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [departments, searchQuery, statusFilter, headFilter, sortBy, sortOrder]);

  const isAdmin = currentUserRole === "ADMIN";

  const totalEmployeesCount = stats?.totalEmployees ?? departments.reduce((acc, d) => acc + (d._count?.employees || 0), 0);
  const totalAssetsCount = stats?.totalAssets ?? departments.reduce((acc, d) => acc + (d._count?.assets || 0), 0);
  const activeCount = stats?.activeDepartments ?? departments.filter(d => d.status === "ACTIVE").length;

  return (
    <Layout>
      <div className="space-y-8 animate-page-enter">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Corporate Departments</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20">
                Enterprise v2.0
              </span>
            </div>
            <p className="text-xs text-slate-450 dark:text-slate-450 mt-1">
              Architect organizational units, delegate leadership, and supervise departmental asset allocations.
            </p>
          </div>
          {isAdmin && (
            <button 
              onClick={openCreateModal}
              className="apple-btn apple-btn-primary"
            >
              <Plus className="h-4 w-4" />
              Add Department
            </button>
          )}
        </div>

        {/* Dynamic KPI Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="premium-card p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-extrabold text-[#007AFF] uppercase tracking-widest">Total Units</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-foreground">
                  {departments.length}
                </h3>
              </div>
              <div className="p-2.5 bg-[#007AFF]/10 rounded-2xl text-[#007AFF]">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-3 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              {activeCount} Active Divisions
            </p>
          </div>

          <div className="premium-card p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-extrabold text-purple-500 uppercase tracking-widest">Staff Assigned</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-foreground">
                  {totalEmployeesCount}
                </h3>
              </div>
              <div className="p-2.5 bg-purple-500/10 rounded-2xl text-purple-500">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-3">
              Allocated across active units
            </p>
          </div>

          <div className="premium-card p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest">Department Assets</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-foreground">
                  {totalAssetsCount}
                </h3>
              </div>
              <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-500">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-3">
              Hardware & facility equipment
            </p>
          </div>

          <div className="premium-card p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest">Leadership Rate</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-foreground">
                  {departments.length > 0 ? `${Math.round((departments.filter(d => d.headId).length / departments.length) * 100)}%` : "0%"}
                </h3>
              </div>
              <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-3">
              {departments.filter(d => d.headId).length} of {departments.length} units with Head
            </p>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="glass-panel p-4 bg-white/50 dark:bg-[#15181D]/45 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="flex-1 flex flex-col sm:flex-row gap-3 items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-80 flex items-center">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Search by division, scope, or head..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input glass-input-icon !pl-11 pr-4 w-full"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100/70 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/20 dark:border-white/5 w-full sm:w-auto">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === "ALL"
                    ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm"
                    : "text-slate-500 hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("ACTIVE")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === "ACTIVE"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-slate-500 hover:text-foreground"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter("INACTIVE")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === "INACTIVE"
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-500 hover:text-foreground"
                }`}
              >
                Inactive
              </button>
            </div>

            {/* Leadership Filter */}
            <select
              value={headFilter}
              onChange={(e) => setHeadFilter(e.target.value as any)}
              className="glass-input !py-1.5 text-xs w-full sm:w-auto bg-white/95 dark:bg-[#15181D]/95"
            >
              <option value="ALL">All Leadership</option>
              <option value="ASSIGNED">Head Assigned</option>
              <option value="UNASSIGNED">Unassigned Head</option>
            </select>
          </div>

          {/* Sorting controls */}
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 hidden sm:inline">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="glass-input !py-1.5 text-xs bg-white/95 dark:bg-[#15181D]/95"
            >
              <option value="name">Name (Alphabetical)</option>
              <option value="employees">Staff Size</option>
              <option value="assets">Asset Count</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
              className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-slate-500 hover:text-foreground transition-all"
              title={`Sorting ${sortOrder.toUpperCase()}`}
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Departments Table / Cards */}
        {isLoading ? (
          <div className="p-16 text-center text-slate-450">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
            Refreshing corporate structure...
          </div>
        ) : filteredAndSortedDepts.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center bg-white dark:bg-[#15181D] rounded-3xl border border-slate-250/20 dark:border-white/5">
            <Building2 className="h-12 w-12 text-slate-350 dark:text-zinc-700 mb-3" />
            <p className="text-sm font-extrabold text-slate-500">No departments found</p>
            <p className="text-xs text-slate-450 mt-1 max-w-[280px]">
              Try refining your search filters or click &quot;Add Department&quot; to initialize new organizational divisions.
            </p>
          </div>
        ) : (
          <div className="luxury-table-container">
            <div className="overflow-x-auto">
              <table className="luxury-table">
                <thead>
                  <tr>
                    <th>Department & Scope</th>
                    <th>Department Head</th>
                    <th className="text-center">Staff Roster</th>
                    <th className="text-center">Allocated Assets</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedDepts.map((dept) => (
                    <tr 
                      key={dept.id}
                      onClick={() => fetchDepartmentDetail(dept.id)}
                      className="cursor-pointer group hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors"
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#007AFF]/15 to-[#8B5CF6]/15 text-[#007AFF] flex items-center justify-center font-bold text-sm shrink-0 border border-[#007AFF]/20">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-extrabold text-foreground text-sm group-hover:text-[#007AFF] transition-colors">
                              {dept.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm truncate mt-0.5">
                              {dept.description || "No specific departmental charter specified."}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td>
                        {dept.head ? (
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-[#007AFF] text-white flex items-center justify-center font-extrabold text-[10px] shadow-sm">
                              {dept.head.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-foreground text-xs">{dept.head.name}</p>
                              <p className="text-[10px] text-slate-400">{dept.head.designation || dept.head.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          <Users className="h-3.5 w-3.5" />
                          {dept._count?.employees ?? 0} Staff
                        </span>
                      </td>

                      <td className="text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          <Package className="h-3.5 w-3.5" />
                          {dept._count?.assets ?? 0} Assets
                        </span>
                      </td>

                      <td>
                        <span className={`status-pill ${
                          dept.status === "ACTIVE" 
                            ? "status-pill-available" 
                            : "bg-slate-100 text-slate-500 border-slate-200/50"
                        }`}>
                          {dept.status}
                        </span>
                      </td>

                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => fetchDepartmentDetail(dept.id)}
                            className="apple-btn apple-btn-secondary py-1.5 px-2.5 text-xs"
                            title="Inspect Division Roster & Assets"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Details
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={(e) => openEditModal(dept, e)}
                                className="apple-btn apple-btn-secondary py-1.5 px-2.5 text-xs"
                                title="Edit Department"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(dept.id, dept.name, e)}
                                className="apple-btn apple-btn-secondary py-1.5 px-2.5 text-xs text-red-500 border-red-500/10 hover:bg-red-500/5"
                                title="Delete Department"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detailed Department Inspection Modal */}
        {viewingDept && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-page-enter">
            <div className="bg-white dark:bg-[#15181D] border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-start justify-between bg-slate-50/50 dark:bg-[#15181D]/30">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#8B5CF6] text-white flex items-center justify-center font-extrabold text-lg shadow-lg shadow-blue-500/20">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-extrabold text-foreground">{viewingDept.name}</h2>
                      <span className={`status-pill ${
                        viewingDept.status === "ACTIVE" ? "status-pill-available" : "bg-slate-100 text-slate-500"
                      }`}>
                        {viewingDept.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                      {viewingDept.description || "Corporate division charter."}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingDept(null)}
                  className="p-2 text-slate-450 hover:text-foreground rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Head Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#007AFF]">
                      Division Leadership
                    </span>
                    {viewingDept.head ? (
                      <div className="flex items-center gap-3 mt-2">
                        <div className="h-9 w-9 rounded-full bg-[#007AFF] text-white flex items-center justify-center font-extrabold text-xs">
                          {viewingDept.head.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-foreground text-sm">{viewingDept.head.name}</p>
                          <p className="text-xs text-slate-400">{viewingDept.head.designation || viewingDept.head.email}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-500 font-bold mt-1">No Department Head currently designated.</p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Roster Sizing
                    </span>
                    <p className="text-sm font-extrabold text-foreground mt-1">
                      {viewingDept._count?.employees || viewingDept.employees?.length || 0} Members
                    </p>
                  </div>
                </div>

                {/* Assigned Personnel Roster preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-purple-500" />
                      Assigned Personnel ({viewingDept.employees?.length || viewingDept._count?.employees || 0})
                    </h4>
                    <Link
                      href="/employees"
                      className="text-[10px] font-bold text-[#007AFF] hover:underline flex items-center gap-0.5"
                    >
                      View all in Roster <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>

                  {viewingDept.employees && viewingDept.employees.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-44 overflow-y-auto pr-1">
                      {viewingDept.employees.map((emp) => (
                        <div 
                          key={emp.id}
                          className="p-2.5 rounded-xl bg-white dark:bg-white/2 border border-slate-100 dark:border-white/5 flex items-center gap-2.5"
                        >
                          <div className="h-7 w-7 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {emp.name[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-foreground truncate">{emp.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{emp.designation || emp.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2">No individual employees assigned yet.</p>
                  )}
                </div>

                {/* Assigned Department Assets preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Package className="h-4 w-4 text-amber-500" />
                      Departmental Assets ({viewingDept.assets?.length || viewingDept._count?.assets || 0})
                    </h4>
                    <Link
                      href="/assets"
                      className="text-[10px] font-bold text-[#007AFF] hover:underline flex items-center gap-0.5"
                    >
                      View in Asset Registry <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>

                  {viewingDept.assets && viewingDept.assets.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-44 overflow-y-auto pr-1">
                      {viewingDept.assets.map((asset) => (
                        <div 
                          key={asset.id}
                          className="p-2.5 rounded-xl bg-white dark:bg-white/2 border border-slate-100 dark:border-white/5 flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-foreground truncate">{asset.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{asset.assetTag}</p>
                          </div>
                          <span className="status-pill status-pill-available text-[9px] py-0.5">
                            {asset.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2">No hardware assets registered to this department.</p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-[#15181D]/30">
                {isAdmin ? (
                  <button
                    onClick={() => {
                      const d = viewingDept;
                      setViewingDept(null);
                      openEditModal(d);
                    }}
                    className="apple-btn apple-btn-secondary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit Division Configuration
                  </button>
                ) : (
                  <div />
                )}
                <button
                  onClick={() => setViewingDept(null)}
                  className="apple-btn apple-btn-primary px-4 py-2 text-xs"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Create/Edit Department */}
        {isModalOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-page-enter">
            <div className="bg-white dark:bg-[#15181D] border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col">
              <div className="h-16 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-6 bg-slate-50/50 dark:bg-[#15181D]/30">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="window-dot dot-close" />
                    <span className="window-dot dot-minimize" />
                    <span className="window-dot dot-maximize" />
                  </div>
                  <h3 className="text-base font-extrabold text-foreground">
                    {editingDept ? "Modify Corporate Department" : "Register New Department"}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-450 hover:text-foreground rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/15 text-red-600 dark:text-red-400 text-xs font-bold rounded-2xl flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {formError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">
                    Department Title *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Finance & Treasury Division"
                    className="glass-input"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">
                    Scope / Charter Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe operational responsibilities and scope..."
                    rows={3}
                    className="glass-input resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">
                    Department Head (Leader)
                  </label>
                  <select
                    name="headId"
                    value={formData.headId}
                    onChange={handleInputChange}
                    className="glass-input bg-white/95 dark:bg-[#15181D]/95"
                  >
                    <option value="">-- Select Department Head (Optional) --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} {emp.designation ? `• ${emp.designation}` : `(${emp.email})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">
                    Operational Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="glass-input bg-white/95 dark:bg-[#15181D]/95"
                  >
                    <option value="ACTIVE">Active Division</option>
                    <option value="INACTIVE">Inactive / Archived</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="apple-btn apple-btn-secondary px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="apple-btn apple-btn-primary px-4 py-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      editingDept ? "Update Department" : "Create Department"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
