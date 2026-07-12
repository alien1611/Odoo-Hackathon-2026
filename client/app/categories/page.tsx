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
      <div className="space-y-8 animate-page-enter">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Asset Categories</h1>
            <p className="text-xs text-slate-450 dark:text-slate-450 mt-1">Configure asset templates and define custom metadata attributes.</p>
          </div>
          {isAdmin && (
            <button 
              onClick={openCreateModal}
              className="apple-btn apple-btn-primary"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="glass-panel p-4 bg-white/50 dark:bg-[#15181D]/45 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input pl-10"
            />
          </div>
          <div className="text-[10px] text-slate-450 font-extrabold uppercase tracking-widest">
            {filteredCategories.length} Templates Configured
          </div>
        </div>

        {/* List Grid */}
        {isLoading ? (
          <div className="p-16 text-center text-slate-455">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
            Loading templates...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center bg-white dark:bg-[#15181D] rounded-3xl border border-slate-250/20 dark:border-white/5">
            <Tag className="h-12 w-12 text-slate-350 dark:text-zinc-700 mb-3" />
            <p className="text-sm font-extrabold text-slate-500">No categories found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[280px]">Add an asset category to setup schema attributes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((cat) => (
              <div 
                key={cat.id} 
                className="premium-card p-6 flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-foreground">
                        <Tag className="h-4.5 w-4.5" />
                      </div>
                      <h3 className="font-extrabold text-base tracking-tight text-foreground">{cat.name}</h3>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-2 text-slate-400 hover:text-foreground rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-4 line-clamp-3 leading-relaxed">
                    {cat.description || "No template description provided."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100/50 dark:border-white/5">
                  <div className="flex items-center gap-1.5 text-[9px] font-extrabold tracking-widest text-slate-450 uppercase mb-3">
                    <Braces className="h-3.5 w-3.5" />
                    <span>Schema Fields</span>
                  </div>
                  {cat.customFields && Object.keys(cat.customFields).length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(cat.customFields).map(([name, type]) => (
                        <span 
                          key={name} 
                          className="inline-flex items-center gap-1.5 py-1 px-3 rounded-lg border border-slate-200/50 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-[10px] font-bold text-slate-600 dark:text-slate-400"
                        >
                          <span className="font-extrabold">{name}</span>
                          <span className="text-[9px] text-[#007AFF]">({type})</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 font-bold italic">No custom attributes schema.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Create/Edit Category */}
        {isModalOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-page-enter">
            <div className="bg-white dark:bg-[#15181D] border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden flex flex-col">
              <div className="h-16 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-6 bg-slate-50/50 dark:bg-[#15181D]/30">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="window-dot dot-close" />
                    <span className="window-dot dot-minimize" />
                    <span className="window-dot dot-maximize" />
                  </div>
                  <h3 className="text-base font-extrabold text-foreground">
                    {editingCategory ? "Edit Asset Category" : "Add Asset Category"}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-foreground rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/15 text-red-600 dark:text-red-400 text-xs font-bold rounded-2xl flex items-center gap-2">
                    {formError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider pl-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Computing Devices"
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
                    placeholder="Describe assets covered under this category..."
                    rows={2}
                    className="glass-input resize-none"
                  />
                </div>

                {/* Custom Fields Builder */}
                <div className="border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 bg-slate-50/50 dark:bg-white/1">
                  <div className="text-xs font-extrabold text-foreground mb-4 flex items-center gap-1.5">
                    <Braces className="h-4.5 w-4.5 text-slate-400" />
                    Schema Attributes Builder
                  </div>

                  {/* Add Field Inputs */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Field name (e.g. RAM)"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      className="flex-1 min-w-0 glass-input text-xs py-1.5"
                    />
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value)}
                      className="w-28 glass-input bg-white/95 dark:bg-[#15181D]/95 text-xs py-1.5"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="boolean">Boolean</option>
                    </select>
                    <button
                      type="button"
                      onClick={addCustomField}
                      className="apple-btn apple-btn-primary py-2 px-4 text-xs font-bold shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>

                  {/* Fields list */}
                  {customFields.length === 0 ? (
                    <p className="text-[10px] text-slate-400 font-bold italic">No custom attributes added yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {customFields.map((field, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center gap-2 py-1 px-3 bg-white dark:bg-[#15181D] border border-slate-250/20 dark:border-white/5 rounded-xl text-xs font-semibold"
                        >
                          <span className="font-extrabold text-foreground">{field.name}</span>
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
