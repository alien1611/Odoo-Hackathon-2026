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
      <div className="space-y-8 animate-page-enter">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Departments</h1>
            <p className="text-xs text-slate-450 dark:text-slate-450 mt-1">Configure and manage corporate departments, scopes, and leaders.</p>
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

        {/* Filter Toolbar */}
        <div className="glass-panel p-4 bg-white/50 dark:bg-[#15181D]/45 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input pl-10"
            />
          </div>
          <div className="text-[10px] text-slate-455 font-extrabold uppercase tracking-widest">
            {filteredDepts.length} Units Active
          </div>
        </div>

        {/* Departments List / Table */}
        {isLoading ? (
          <div className="p-16 text-center text-slate-450">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
            Refreshing directory...
          </div>
        ) : filteredDepts.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center bg-white dark:bg-[#15181D] rounded-3xl border border-slate-250/20 dark:border-white/5">
            <Building2 className="h-12 w-12 text-slate-350 dark:text-zinc-700 mb-3" />
            <p className="text-sm font-extrabold text-slate-500">No departments found</p>
            <p className="text-xs text-slate-450 mt-1 max-w-[280px]">Add a corporate department to organize rosters and categories.</p>
          </div>
        ) : (
          <div className="luxury-table-container">
            <div className="overflow-x-auto">
              <table className="luxury-table">
                <thead>
                  <tr>
                    <th>Department Name</th>
                    <th>Description</th>
                    <th>Department Head</th>
                    <th>Status</th>
                    {isAdmin && <th className="text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredDepts.map((dept) => (
                    <tr key={dept.id}>
                      <td className="font-extrabold text-foreground">
                        {dept.name}
                      </td>
                      <td className="max-w-xs truncate text-slate-500 dark:text-slate-400 font-semibold">
                        {dept.description || "—"}
                      </td>
                      <td>
                        {dept.head ? (
                          <div className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-semibold shrink-0">
                              <User className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground">{dept.head.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{dept.head.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic font-semibold">Unassigned</span>
                        )}
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
                      {isAdmin && (
                        <td className="text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => openEditModal(dept)}
                            className="apple-btn apple-btn-secondary py-1.5 px-3"
                            title="Edit Department"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(dept.id)}
                            className="apple-btn apple-btn-secondary py-1.5 px-3 text-red-500 border-red-500/10 hover:bg-red-500/5"
                            title="Delete Department"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
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
                    {editingDept ? "Edit Department" : "Add Department"}
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
                    {formError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">
                    Department Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Finance Division"
                    className="glass-input"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a brief description..."
                    rows={3}
                    className="glass-input resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">
                    Department Head
                  </label>
                  <select
                    name="headId"
                    value={formData.headId}
                    onChange={handleInputChange}
                    className="glass-input bg-white/95 dark:bg-[#15181D]/95"
                  >
                    <option value="">Unassigned</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="glass-input bg-white/95 dark:bg-[#15181D]/95"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
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
