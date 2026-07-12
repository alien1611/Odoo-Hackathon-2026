// client/app/employees/page.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { 
  Users, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert, 
  Edit,
  Loader2,
  X
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE" | "ASSET_MANAGER" | "DEPARTMENT_HEAD";
  designation: string | null;
  departmentId: string | null;
  status: string;
}

interface Department {
  id: string;
  name: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Edit / Promote states
  const [newRole, setNewRole] = useState("");
  const [editFormData, setEditFormData] = useState({
    designation: "",
    departmentId: "",
    status: "ACTIVE"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get("/users/directory", {
        params: {
          page,
          limit,
          search: searchQuery || undefined
        }
      });

      if (response.data.success) {
        setEmployees(response.data.data.users);
        setTotal(response.data.data.total);
      }
    } catch (err) {
      setError("Failed to fetch employee records.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (err) {
      console.error("Failed to load departments:", err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUserRole(user.role);
    }

    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [page, searchQuery]);

  const openPromoteModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setNewRole(emp.role);
    setActionError(null);
    setIsPromoteModalOpen(true);
  };

  const handlePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      setIsSubmitting(true);
      setActionError(null);

      const response = await api.patch(`/users/promote/${selectedEmployee.id}`, { role: newRole });
      if (response.data.success) {
        setIsPromoteModalOpen(false);
        fetchEmployees();
        // Update stored user if promoting self
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user.id === selectedEmployee.id) {
            user.role = newRole;
            localStorage.setItem("user", JSON.stringify(user));
            window.location.reload();
          }
        }
      }
    } catch (err) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setActionError(errorResponse.response?.data?.message || "Failed to promote employee.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setEditFormData({
      designation: emp.designation || "",
      departmentId: emp.departmentId || "",
      status: emp.status
    });
    setActionError(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      setIsSubmitting(true);
      setActionError(null);

      const payload = {
        designation: editFormData.designation || null,
        departmentId: editFormData.departmentId || null,
        status: editFormData.status
      };

      const response = await api.patch(`/users/${selectedEmployee.id}`, payload);
      if (response.data.success) {
        setIsEditModalOpen(false);
        fetchEmployees();
      }
    } catch (err) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setActionError(errorResponse.response?.data?.message || "Failed to update employee profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDepartmentName = (deptId: string | null) => {
    if (!deptId) return "—";
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : "Unknown Department";
  };

  const getRolePillClass = (role: string) => {
    switch (role) {
      case "ADMIN": return "status-pill-available text-[#007AFF] bg-[#007AFF]/10";
      case "ASSET_MANAGER": return "status-pill-allocated";
      case "DEPARTMENT_HEAD": return "status-pill-reserved";
      default: return "bg-slate-100 text-slate-650 border-slate-205/50";
    }
  };

  const isAdmin = currentUserRole === "ADMIN";
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <Layout>
      <div className="space-y-8 animate-page-enter">
        
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Employee Directory</h1>
          <p className="text-xs text-slate-455 mt-1">Manage personnel profiles, workspace assignments, and access control scopes.</p>
        </div>

        {/* Toolbar */}
        <div className="glass-panel p-4 bg-white/50 dark:bg-[#15181D]/45 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="glass-input pl-10"
            />
          </div>
          <div className="text-[10px] text-slate-450 font-extrabold uppercase tracking-widest">
            {total} Employees Registered
          </div>
        </div>

        {/* Employee Directory List / Table */}
        {isLoading ? (
          <div className="p-16 text-center text-slate-450">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
            Refreshing records...
          </div>
        ) : error ? (
          <div className="p-16 text-center text-red-650 bg-red-500/5 rounded-2xl border border-red-500/10">
            <p className="font-extrabold text-sm">{error}</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center bg-white dark:bg-[#15181D] rounded-3xl border border-slate-250/20 dark:border-white/5">
            <Users className="h-12 w-12 text-slate-350 dark:text-zinc-700 mb-3" />
            <p className="text-sm font-extrabold text-slate-500">No personnel found</p>
            <p className="text-xs text-slate-450 mt-1 max-w-[280px]">No matching employee records were found in the database.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="luxury-table-container">
              <div className="overflow-x-auto">
                <table className="luxury-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Designation</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Status</th>
                      {isAdmin && <th className="text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-900 dark:bg-white/5 text-white dark:text-slate-300 flex items-center justify-center font-extrabold text-xs shrink-0">
                              {emp.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-extrabold text-foreground">{emp.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="font-semibold text-slate-500 dark:text-slate-400">
                          {emp.designation || "—"}
                        </td>
                        <td>
                          <span className={`status-pill ${getRolePillClass(emp.role)}`}>
                            {emp.role.replace("_", " ")}
                          </span>
                        </td>
                        <td className="font-bold text-foreground">
                          {getDepartmentName(emp.departmentId)}
                        </td>
                        <td>
                          <span className={`status-pill ${
                            emp.status === "ACTIVE" 
                              ? "status-pill-available" 
                              : "bg-slate-105 text-slate-500 border-slate-200/50"
                          }`}>
                            {emp.status}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => openPromoteModal(emp)}
                              className="apple-btn apple-btn-secondary py-1.5 px-3"
                              title="Promote Role"
                            >
                              <ShieldAlert className="h-3.5 w-3.5" />
                              Promote
                            </button>
                            <button
                              onClick={() => openEditModal(emp)}
                              className="apple-btn apple-btn-primary py-1.5 px-3"
                              title="Assign Department / Edit"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Setup
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="glass-panel p-4 bg-white/50 dark:bg-[#15181D]/45 flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="apple-btn apple-btn-secondary p-2 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="apple-btn apple-btn-secondary p-2 disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal: Promote Role */}
        {isPromoteModalOpen && selectedEmployee && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-page-enter">
            <div className="bg-white dark:bg-[#15181D] border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-2xl w-full max-w-sm relative overflow-hidden flex flex-col">
              <div className="h-16 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-6 bg-slate-50/50 dark:bg-[#15181D]/30">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="window-dot dot-close" />
                    <span className="window-dot dot-minimize" />
                    <span className="window-dot dot-maximize" />
                  </div>
                  <h3 className="text-base font-extrabold text-foreground">
                    Promote Role
                  </h3>
                </div>
                <button 
                  onClick={() => setIsPromoteModalOpen(false)}
                  className="p-2 text-slate-450 hover:text-foreground rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handlePromotion} className="p-6 space-y-5">
                {actionError && (
                  <div className="p-3 bg-red-550/10 border border-red-500/15 text-red-600 dark:text-red-400 text-xs font-bold rounded-2xl flex items-center gap-2">
                    {actionError}
                  </div>
                )}

                <div className="text-center pb-2">
                  <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">Access Scope for</p>
                  <p className="font-extrabold text-foreground text-lg mt-1">{selectedEmployee.name}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">
                    Select New Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="glass-input bg-white/95 dark:bg-[#15181D]/95"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ASSET_MANAGER">Asset Manager</option>
                    <option value="DEPARTMENT_HEAD">Department Head</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPromoteModalOpen(false)}
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
                      "Promote Role"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Setup / Department & Info Edit */}
        {isEditModalOpen && selectedEmployee && (
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
                    Employee Setup
                  </h3>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 text-slate-450 hover:text-foreground rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                {actionError && (
                  <div className="p-3 bg-red-550/10 border border-red-500/15 text-red-650 dark:text-red-400 text-xs font-bold rounded-2xl flex items-center gap-2">
                    {actionError}
                  </div>
                )}

                <div className="pb-2">
                  <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">Updating Profile Details</p>
                  <p className="font-extrabold text-foreground mt-1">{selectedEmployee.name}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={editFormData.designation}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, designation: e.target.value }))}
                    placeholder="e.g. Senior Software Architect"
                    className="glass-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">
                    Department Assignment
                  </label>
                  <select
                    value={editFormData.departmentId}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                    className="glass-input bg-white/95 dark:bg-[#15181D]/95"
                  >
                    <option value="">Unassigned</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">
                    Employment Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="glass-input bg-white/95 dark:bg-[#15181D]/95"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
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
                      "Save Settings"
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
