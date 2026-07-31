import React, { useEffect, useState } from 'react';
import { FolderTree, Plus, Search, Edit2, Trash2, CheckCircle2, AlertTriangle, RefreshCw, FolderPlus } from 'lucide-react';
import { api } from '../../lib/api.js';
import { Category } from '../../types.js';

export const AdminCategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Calendar');
  const [description, setDescription] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getCategories();
      setCategories(res.categories || []);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load categories' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setIcon('Calendar');
    setDescription('');
    setShowModal(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIcon(cat.icon || 'Calendar');
    setDescription(cat.description || '');
    setShowModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, {
          name: name.trim(),
          icon: icon.trim(),
          description: description.trim(),
        });
        setMessage({ type: 'success', text: `Category "${name}" updated successfully` });
      } else {
        await api.createCategory({
          name: name.trim(),
          icon: icon.trim(),
          description: description.trim(),
        });
        setMessage({ type: 'success', text: `Category "${name}" created successfully` });
      }
      setShowModal(false);
      loadCategories();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save category' });
    }
  };

  const handleDeleteCategory = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    try {
      await api.deleteCategory(id);
      setMessage({ type: 'success', text: `Category "${catName}" deleted successfully` });
      loadCategories();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete category' });
    }
  };

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderTree className="h-6 w-6 text-amber-500" />
            Category Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add, edit, or remove event categories across the platform catalog.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
        >
          <FolderPlus className="h-4 w-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-700 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-700 dark:text-rose-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
          />
        </div>
        <button onClick={loadCategories} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-xs text-slate-500 col-span-3 py-8 text-center">Loading categories...</p>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-slate-500 col-span-3 py-8 text-center">No categories found.</p>
        ) : (
          filtered.map(cat => (
            <div key={cat.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center font-bold text-xs">
                    {cat.name.charAt(0)}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{cat.name}</h3>
                </div>
                {cat.description && (
                  <p className="text-xs text-slate-500 line-clamp-2">{cat.description}</p>
                )}
                {cat.eventCount !== undefined && (
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">{cat.eventCount} Events</p>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
                  title="Edit Category"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg text-rose-500"
                  title="Delete Category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h2>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., Tech & Innovation"
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Icon Name</label>
                <input
                  type="text"
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                  placeholder="Calendar, Music, Code..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description of events in this category..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
