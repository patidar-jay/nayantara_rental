// ============================================================================
// ProductFormModal — Add / Edit product modal for admin dashboard
// ============================================================================

import { useState, useEffect } from 'react';
import { useCreateProduct, useUpdateProduct, useCategories } from '@hooks';
import { useToast } from '@presentation/shared/Toast';
import type { ProductWithCategory, ProductInsert } from '@core/entities';
import { cn } from '@utils';
import ProductMediaManager from './ProductMediaManager';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** If provided, we're editing; otherwise creating. */
  product?: ProductWithCategory | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const selectArrowStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  backgroundSize: '16px',
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProductFormModal({ isOpen, onClose, product }: ProductFormModalProps) {
  const toast = useToast();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const isEditing = !!product;

  // ---- Form State ----
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState('0');
  const [autoSlug, setAutoSlug] = useState(true);

  // ---- Pre-fill on edit ----
  useEffect(() => {
    if (product) {
      setName(product.name);
      setSlug(product.slug);
      setDescription(product.description ?? '');
      setCategoryId(product.category_id);
      setPrice(String(product.rental_price_per_day));
      setQuantity(String(product.total_quantity));
      setStatus(product.status);
      setIsFeatured(product.is_featured);
      setSortOrder(String(product.sort_order));
      setAutoSlug(false);
    } else {
      // Reset form for "Add" mode
      setName('');
      setSlug('');
      setDescription('');
      setCategoryId('');
      setPrice('');
      setQuantity('1');
      setStatus('active');
      setIsFeatured(false);
      setSortOrder('0');
      setAutoSlug(true);
    }
  }, [product, isOpen]);

  // ---- Auto-slug from name ----
  useEffect(() => {
    if (autoSlug && name) {
      setSlug(slugify(name));
    }
  }, [name, autoSlug]);

  // ---- Validation ----
  const isValid =
    name.trim().length >= 2 &&
    slug.trim().length >= 2 &&
    categoryId !== '' &&
    Number(price) > 0 &&
    Number(quantity) >= 1;

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const payload: ProductInsert = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      category_id: categoryId,
      rental_price_per_day: Number(price),
      total_quantity: Number(quantity),
      status,
      is_featured: isFeatured,
      sort_order: Number(sortOrder) || 0,
    };

    try {
      if (isEditing && product) {
        await updateProduct.mutateAsync({ id: product.id, ...payload });
        toast.success(`"${name}" updated successfully`);
      } else {
        await createProduct.mutateAsync(payload);
        toast.success(`"${name}" created successfully`);
      }
      onClose();
    } catch (err) {
      toast.error((err as Error).message ?? 'Something went wrong');
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface rounded-t-2xl z-10">
            <h2 className="text-lg font-bold text-text">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text transition-colors rounded-lg hover:bg-background"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="pf_name" className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                Product Name *
              </label>
              <input
                id="pf_name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Red Bridal Lehenga"
                className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="pf_slug" className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                URL Slug *
              </label>
              <input
                id="pf_slug"
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }}
                placeholder="red-bridal-lehenga"
                className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-mono"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="pf_category" className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                Category *
              </label>
              <select
                id="pf_category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl bg-background border border-border px-4 py-2.5 pr-10 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer appearance-none"
                style={selectArrowStyle}
              >
                <option value="">Select a category</option>
                {(categories ?? []).map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Price + Quantity row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="pf_price" className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                  Price / Day (₹) *
                </label>
                <input
                  id="pf_price"
                  type="number"
                  min="1"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="500"
                  className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
              <div>
                <label htmlFor="pf_qty" className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                  Total Quantity *
                </label>
                <input
                  id="pf_qty"
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="5"
                  className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="pf_desc" className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                Description
              </label>
              <textarea
                id="pf_desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description..."
                className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
              />
            </div>

            {/* Status + Featured + Sort row */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="pf_status" className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                  Status
                </label>
                <select
                  id="pf_status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full rounded-xl bg-background border border-border px-4 py-2.5 pr-10 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer appearance-none"
                  style={selectArrowStyle}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label htmlFor="pf_sort" className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                  Sort Order
                </label>
                <input
                  id="pf_sort"
                  type="number"
                  min="0"
                  step="1"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary/40 bg-background"
                  />
                  <span className="text-sm text-text-muted">Featured</span>
                </label>
              </div>
            </div>

            {/* Media Upload — only available when editing (needs product ID) */}
            {isEditing && product && (
              <div className="pt-4 border-t border-border">
                <ProductMediaManager productId={product.id} />
              </div>
            )}

            {!isEditing && (
              <div className="rounded-xl bg-background/50 border border-border/50 px-4 py-3">
                <p className="text-xs text-text-muted text-center">
                  💡 Save the product first, then you can upload images & videos
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-muted hover:bg-background transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid || isPending}
                className={cn(
                  'flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2',
                  isValid
                    ? 'bg-primary text-background hover:opacity-90 shadow-lg shadow-primary/20'
                    : 'bg-surface text-text-muted cursor-not-allowed',
                )}
              >
                {isPending ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
                    {isEditing ? 'Saving…' : 'Creating…'}
                  </>
                ) : (
                  isEditing ? 'Save Changes' : 'Create Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
