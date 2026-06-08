// ============================================================================
// CategoryManagementPage — Admin category CRUD with live Supabase data
// ============================================================================

import { useState, useRef } from 'react';
import { supabase } from '@infrastructure/api/supabaseClient';
import type { Category } from '@core/entities';
import { useAllCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@hooks';
import { useToast } from '@presentation/shared/Toast';
import { cn } from '@utils';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CategoryManagementPage() {
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories, isLoading } = useAllCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large (max 5MB)');
      return;
    }

    setIsUploading(true);
    try {
      if (newImage && newImage.includes('/product-media/') && (!editingCategory || newImage !== editingCategory.image_url)) {
        const urlParts = newImage.split('/product-media/');
        if (urlParts.length === 2) {
          supabase.storage.from('product-media').remove([urlParts[1]]).catch(console.error);
        }
      }

      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const fileName = `categories/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('product-media')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('product-media').getPublicUrl(fileName);
      setNewImage(urlData.publicUrl);
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error(`Failed to upload image: ${(err as Error).message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      if (editingCategory) {
        const oldImage = editingCategory.image_url;
        const newImageUrl = newImage.trim() || null;
        
        if (oldImage && oldImage !== newImageUrl && oldImage.includes('/product-media/')) {
          const urlParts = oldImage.split('/product-media/');
          if (urlParts.length === 2) {
            supabase.storage.from('product-media').remove([urlParts[1]]).catch(console.error);
          }
        }

        await updateCategory.mutateAsync({
          id: editingCategory.id,
          name: newName.trim(),
          slug: slugify(newName.trim()),
          description: newDesc.trim() || null,
          image_url: newImage.trim() || null,
        });
        toast.success('Category updated');
      } else {
        await createCategory.mutateAsync({
          name: newName.trim(),
          slug: slugify(newName.trim()),
          description: newDesc.trim() || null,
          image_url: newImage.trim() || null,
        });
        toast.success('Category created');
      }
      setNewName('');
      setNewDesc('');
      setNewImage('');
      setEditingCategory(null);
      setShowForm(false);
    } catch (err) {
      toast.error((err as Error).message ?? `Failed to ${editingCategory ? 'update' : 'create'} category`);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateCategory.mutateAsync({ id, is_active: !currentActive });
      toast.success(`Category ${currentActive ? 'deactivated' : 'activated'}`);
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to update category');
    }
  };

  const handleDelete = async (id: string, name: string, imageUrl: string | null) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteCategory.mutateAsync(id);

      if (imageUrl && imageUrl.includes('/product-media/')) {
        const urlParts = imageUrl.split('/product-media/');
        if (urlParts.length === 2) {
          supabase.storage.from('product-media').remove([urlParts[1]]).catch(console.error);
        }
      }

      toast.success(`"${name}" deleted`);
    } catch (err) {
      const message = (err as Error).message ?? '';
      if (message.includes('foreign key') || message.includes('violates') || message.includes('products_category_id_fkey')) {
        toast.error(`Cannot delete "${name}" — it still has products assigned. Move or delete the products first.`);
      } else {
        toast.error(message || 'Failed to delete category');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">Category Management</h1>
          <p className="mt-1 text-sm text-text-muted">
            {(categories ?? []).length} categories total
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingCategory(null);
              setNewName('');
              setNewDesc('');
              setNewImage('');
            } else {
              setShowForm(true);
            }
          }}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all',
            showForm
              ? 'bg-surface text-text-muted hover:bg-surface'
              : 'bg-primary text-text shadow-lg shadow-primary/20 hover:opacity-90'
          )}
        >
          {showForm ? (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              Cancel
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Add Category
            </>
          )}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-surface border border-primary/20 p-6 space-y-4">
          <h3 className="text-base font-semibold text-text">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cat_name" className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Name</label>
              <input
                id="cat_name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Lighting"
                className="w-full rounded-xl bg-surface border border-border px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
              {newName && (
                <p className="mt-1 text-xs text-text-muted">Slug: {slugify(newName)}</p>
              )}
            </div>
            <div>
              <label htmlFor="cat_desc" className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Description</label>
              <input
                id="cat_desc"
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Short description (optional)"
                className="w-full rounded-xl bg-surface border border-border px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="cat_image" className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">Image / Icon</label>
              <div className="flex gap-2">
                <input
                  id="cat_image"
                  type="text"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="Image URL or Font Icon Class (e.g. fa fa-star)"
                  className="flex-1 rounded-xl bg-surface border border-border px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="rounded-xl border border-border bg-surface hover:bg-surface/80 px-4 py-2.5 text-sm font-medium text-text transition-all whitespace-nowrap flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                      Upload
                    </>
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-text-muted">You can upload an image or manually enter an image URL / font class name.</p>
              {newImage && newImage.startsWith('http') && (
                <div className="mt-2 h-16 w-16 rounded-lg overflow-hidden border border-border">
                  <img src={newImage} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={!newName.trim() || createCategory.isPending || updateCategory.isPending}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-text hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {createCategory.isPending || updateCategory.isPending ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Saving...
              </>
            ) : editingCategory ? 'Save Changes' : 'Create Category'}
          </button>
        </form>
      )}

      {/* Category List */}
      <div className="rounded-2xl bg-surface border border-border overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="h-4 w-32 skeleton rounded" />
                <div className="h-4 w-20 skeleton rounded ml-auto" />
              </div>
            ))}
          </div>
        ) : (categories ?? []).length > 0 ? (
          <div className="divide-y divide-border">
            {(categories ?? []).map((cat) => (
              <div key={cat.id} className="flex items-center justify-between px-6 py-4 hover:bg-surface transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary flex-shrink-0">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /></svg>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-text">{cat.name}</p>
                      <span className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                        cat.is_active ? 'bg-green-400/10 text-green-400' : 'bg-surface/10 text-text-muted'
                      )}>
                        <span className={cn('h-1 w-1 rounded-full', cat.is_active ? 'bg-green-400' : 'bg-surface')} />
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-[10px] text-text-muted font-mono">#{cat.sort_order}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-text-muted truncate">{cat.description || 'No description'}</p>
                      <span className="text-[10px] text-text-muted">· /{cat.slug}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(cat.id, cat.is_active)}
                    disabled={updateCategory.isPending}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50',
                      cat.is_active
                        ? 'border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10'
                        : 'border border-green-500/20 text-green-400 hover:bg-green-500/10'
                    )}
                  >
                    {cat.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(cat);
                      setNewName(cat.name);
                      setNewDesc(cat.description || '');
                      setNewImage(cat.image_url || '');
                      setShowForm(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={updateCategory.isPending}
                    className="rounded-lg border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 disabled:opacity-50 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id, cat.name, cat.image_url)}
                    disabled={deleteCategory.isPending}
                    className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-sm text-text-muted">No categories yet. Create your first one above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
