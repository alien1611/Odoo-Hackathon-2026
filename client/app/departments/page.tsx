// client/app/departments/page.tsx
"use client";

import { useEffect, useState } from "react";
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
  CheckCircle2, 
  XCircle,
  Loader2
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
}

interface Department {
  id: string;
  name: string;
  description: string | null;
  headId: string | null;
  status: string;
  createdAt: string;
  head: Employee | null;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    headId: "",
    status: "ACTIVE"
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/departments");
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (err) {
      setError("Failed to fetch departments list.");
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
      console.error("Failed to load employee list:", err);
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

  const openEditModal = (dept: Department) => {
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
        name: formData.name,
        description: formData.description || null,
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
      setFormError(errorResponse.response?.data?.message || "Failed to save department.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    try {
      const response = await api.delete(`/departments/${id}`);
      if (response.data.success) {
        fetchDepartments();
      }
    } catch (err) {
      alert("Failed to delete department. Make sure no assets or users are associated with it.");
      console.error(err);
    }
  };

  const filteredDepts = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dept.description && dept.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isAdmin = currentUserRole === "ADMIN";

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Departments Setup</h1>
            <p className="text-sm text-slate-500 mt-1">Configure and manage corporate departments</p>
          </div>
          {isAdmin && (
            <button 
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Department
            </button>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
            />
          </div>
          <div className="text-xs text-slate-400 font-semibold uppercase">
            Showing {filteredDepts.length} of {departments.length} Departments
          </div>
        </div>

        {/* Departments List / Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20 bg-white border border-slate-200 rounded-lg">
            <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
          </div>
        ) : filteredDepts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg py-16 px-4 text-center">
            <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-800">No Departments Found</h3>
            <p className="text-sm text-slate-500 mt-1">Try modifying your search or add a new department to get started.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Department Name</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Department Head</th>
                    <th className="px-6 py-4">Status</th>
                    {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredDepts.map((dept) => (
                    <tr key={dept.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {dept.name}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-slate-500">
                        {dept.description || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {dept.head ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-semibold">
                              <User className="h-3 w-3" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{dept.head.name}</p>
                              <p className="text-xs text-slate-400">{dept.head.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-xs font-bold ${
                          dept.status === "ACTIVE" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}>
                          {dept.status === "ACTIVE" ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5" /> Inactive
                            </>
                          )}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(dept)}
                              className="p-1.5 text-slate-500 rounded-md hover:bg-slate-100 hover:text-slate-800 transition-colors"
                              title="Edit Department"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(dept.id)}
                              className="p-1.5 text-red-500 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
                              title="Delete Department"
                            >
                              <Trash2 className="h-4 w-4" />
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
        )}

        {/* Modal: Create/Edit Department */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg border border-slate-200 w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
              <div className="h-14 border-b border-slate-250 flex items-center justify-between px-6 bg-slate-50">
                <h3 className="text-base font-bold text-slate-900">
                  {editingDept ? "Edit Department" : "Add Department"}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 rounded-md"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Department Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Finance Division"
                    className="w-full px-3 py-2 border border-slate-350 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a brief description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-350 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Department Head
                  </label>
                  <select
                    name="headId"
                    value={formData.headId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-350 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-350 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
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
                      "Save Department"
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
