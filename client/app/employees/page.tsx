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
  Building2, 
  ToggleLeft,
  ToggleRight,
  Edit,
  User,
  Loader2,
  CheckCircle2,
  XCircle,
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

  const isAdmin = currentUserRole === "ADMIN";
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employee Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor organization personnel, roles, and department assignments</p>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
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
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
            />
          </div>
          <div className="text-xs text-slate-400 font-semibold uppercase">
            Showing {employees.length} of {total} Employees
          </div>
        </div>

        {/* Employee Directory List / Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20 bg-white border border-slate-200 rounded-lg">
            <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-white border border-slate-200 rounded-lg py-16 px-4 text-center">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg py-16 px-4 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-800">No Employees Found</h3>
            <p className="text-sm text-slate-500 mt-1">No matching employee records are registered in the directory.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Employee</th>
                      <th className="px-6 py-4">Designation</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Status</th>
                      {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                              {emp.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{emp.name}</p>
                              <p className="text-xs text-slate-400">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-600">
                          {emp.designation || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 py-0.5 px-2 bg-slate-100 border border-slate-250 rounded text-xs font-bold text-slate-700`}>
                            {emp.role.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {getDepartmentName(emp.departmentId)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-xs font-bold ${
                            emp.status === "ACTIVE" 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}>
                            {emp.status === "ACTIVE" ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" /> Active
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" /> Inactive
                              </>
                            )}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => openPromoteModal(emp)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded text-xs font-bold text-slate-650 hover:bg-slate-50 transition-colors"
                                title="Promote Role"
                              >
                                <ShieldAlert className="h-3.5 w-3.5" />
                                Promote
                              </button>
                              <button
                                onClick={() => openEditModal(emp)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 rounded text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                                title="Assign Department / Edit"
                              >
                                <Edit className="h-3.5 w-3.5" />
                                Setup
                              </button>
                            </div>
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
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors text-slate-500"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors text-slate-500"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal: Promote Role */}
        {isPromoteModalOpen && selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg border border-slate-200 w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
              <div className="h-14 border-b border-slate-250 flex items-center justify-between px-6 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Promote Role
                </h3>
                <button 
                  onClick={() => setIsPromoteModalOpen(false)}
                  className="p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 rounded-md"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handlePromotion} className="p-6 space-y-4">
                {actionError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                    {actionError}
                  </div>
                )}

                <div className="text-center pb-2">
                  <p className="text-sm text-slate-500">Update security authorization role for</p>
                  <p className="font-bold text-slate-900 text-base mt-0.5">{selectedEmployee.name}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-1">
                    Select New Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-350 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-semibold text-slate-700"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ASSET_MANAGER">Asset Manager</option>
                    <option value="DEPARTMENT_HEAD">Department Head</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPromoteModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg border border-slate-200 w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
              <div className="h-14 border-b border-slate-250 flex items-center justify-between px-6 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Employee Setup
                </h3>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 rounded-md"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                {actionError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                    {actionError}
                  </div>
                )}

                <div className="pb-2">
                  <p className="text-xs text-slate-400">Updating profile details for</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedEmployee.name} ({selectedEmployee.email})</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={editFormData.designation}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, designation: e.target.value }))}
                    placeholder="e.g. Senior Software Architect"
                    className="w-full px-3 py-2 border border-slate-350 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-1">
                    Department Assignment
                  </label>
                  <select
                    value={editFormData.departmentId}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-350 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-semibold text-slate-700"
                  >
                    <option value="">Unassigned</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-1">
                    Employment Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-350 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-semibold text-slate-700"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
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
