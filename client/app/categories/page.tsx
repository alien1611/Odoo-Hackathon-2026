// client/app/categories/page.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/axios";
import { 
  Tag, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Braces, 
  Check,
  Loader2
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
  customFields: Record<string, string> | null; // e.g. { "RAM": "text", "CPU": "text" }
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  
  // Custom fields handling
  const [customFields, setCustomFields] = useState<Array<{ name: string; type: string }>>([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/categories");
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      setError("Failed to fetch asset categories.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUserRole(user.role);
    }

    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setCustomFields([]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || "",
    });
    
    // Parse customFields from record to array
    const fieldsArray = cat.customFields 
      ? Object.entries(cat.customFields).map(([name, type]) => ({ name, type }))
      : [];
    setCustomFields(fieldsArray);
    
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addCustomField = () => {
    if (!newFieldName.trim()) return;
    
    // Check for duplicate field names
    if (customFields.some(f => f.name.toLowerCase() === newFieldName.trim().toLowerCase())) {
      alert("Field name already exists.");
      return;
    }

    setCustomFields(prev => [...prev, { name: newFieldName.trim(), type: newFieldType }]);
    setNewFieldName("");
  };

  const removeCustomField = (index: number) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Category name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      
      // Convert custom fields array back to JSON object record
      const customFieldsJson: Record<string, string> = {};
      customFields.forEach(f => {
        customFieldsJson[f.name] = f.type;
      });

      const payload = {
        name: formData.name,
        description: formData.description || null,
        customFields: customFields.length > 0 ? customFieldsJson : null
      };

      let response;
      if (editingCategory) {
        response = await api.patch(`/categories/${editingCategory.id}`, payload);
      } else {
        response = await api.post("/categories", payload);
      }

      if (response.data.success) {
        setIsModalOpen(false);
        fetchCategories();
      }
    } catch (err) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setFormError(errorResponse.response?.data?.message || "Failed to save category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category? All associated assets might block this action.")) return;
    try {
      const response = await api.delete(`/categories/${id}`);
      if (response.data.success) {
        fetchCategories();
      }
    } catch (err) {
      alert("Failed to delete category. Ensure no assets are mapped to this category.");
      console.error(err);
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isAdmin = currentUserRole === "ADMIN";

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Asset Categories</h1>
            <p className="text-sm text-slate-500 mt-1">Configure asset templates and custom JSON fields</p>
          </div>
          {isAdmin && (
            <button 
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
            />
          </div>
          <div className="text-xs text-slate-400 font-semibold uppercase">
            Showing {filteredCategories.length} of {categories.length} Templates
          </div>
        </div>

        {/* List Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20 bg-white border border-slate-200 rounded-lg">
            <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg py-16 px-4 text-center">
            <Tag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-800">No Categories Defined</h3>
            <p className="text-sm text-slate-500 mt-1">Configure asset templates and define custom metadata attributes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCategories.map((cat) => (
              <div 
                key={cat.id} 
                className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-150 rounded text-slate-800">
                        <Tag className="h-4.5 w-4.5" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">{cat.name}</h3>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-3 line-clamp-2">
                    {cat.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase mb-2">
                    <Braces className="h-3.5 w-3.5" />
                    <span>Custom Schema Fields</span>
                  </div>
                  {cat.customFields && Object.keys(cat.customFields).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(cat.customFields).map(([name, type]) => (
                        <span 
                          key={name} 
                          className="inline-flex items-center gap-1 py-0.5 px-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-650"
                        >
                          <span className="font-bold">{name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">({type})</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No custom fields defined</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Create/Edit Category */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg border border-slate-200 w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
              <div className="h-14 border-b border-slate-250 flex items-center justify-between px-6 bg-slate-50">
                <h3 className="text-base font-bold text-slate-900">
                  {editingCategory ? "Edit Asset Category" : "Add Asset Category"}
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
                    Category Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Computing Devices"
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
                    placeholder="Describe assets covered under this category..."
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-350 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                  />
                </div>

                {/* Custom Fields Builder */}
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                    <Braces className="h-4.5 w-4.5 text-slate-400" />
                    Custom Attributes Schema
                  </div>

                  {/* Add Field Inputs */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Field name (e.g. RAM)"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-1.5 border border-slate-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                    />
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value)}
                      className="w-28 px-2 py-1.5 border border-slate-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="boolean">Boolean</option>
                    </select>
                    <button
                      type="button"
                      onClick={addCustomField}
                      className="bg-slate-900 text-white px-3 py-1.5 rounded-md hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>

                  {/* Fields list */}
                  {customFields.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No custom attributes added yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {customFields.map((field, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center gap-1.5 py-1 pl-2.5 pr-1.5 bg-white border border-slate-200 rounded-md text-xs"
                        >
                          <span className="font-semibold text-slate-700">{field.name}</span>
                          <span className="text-[10px] text-slate-400">({field.type})</span>
                          <button
                            type="button"
                            onClick={() => removeCustomField(idx)}
                            className="p-0.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
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
                      "Save Category"
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
