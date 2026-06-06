// ============================================================================
// ProductManagementPage — Admin product table with live Supabase data
// ============================================================================

import { useState } from 'react';
import { useProducts, useDeleteProduct, useCategories } from '@hooks';
import type { ProductWithCategory, ProductStatus } from '@core/entities';
import { useToast } from '@presentation/shared/Toast';
import { formatCurrency, cn } from '@utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type StatusFilter = 'all' | 'active' | 'inactive';
const ITEMS_PER_PAGE = 5;

const GRADIENTS = [
  'from-brand-600/40 to-brand-800/40',
  'from-accent-500/30 to-brand-700/30',
  'from-indigo-600/30 to-purple-700/30',
  'from-teal-600/30 to-cyan-700/30',
  'from-rose-600/30 to-pink-700/30',
  'from-amber-500/30 to-orange-600/30',
  'from-emerald-600/30 to-green-700/30',
  'from-sky-500/30 to-blue-600/30',
];

const selectArrowStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  backgroundSize: '16px',
} as const;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProductThumbnail({ name, index }: { name: string; index: number }) {
  return (
    <div className={cn('h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0', GRADIENTS[index % GRADIENTS.length])}>
      <span className="text-xs font-bold text-white/70 uppercase">{name.charAt(0)}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
  const isActive = status === 'active';
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', isActive ? 'bg-green-400/10 text-green-400' : 'bg-gray-500/10 text-gray-500')}>
      <span className={cn('h-1.5 w-1.5 rounded-full', isActive ? 'bg-green-400' : 'bg-gray-500')} />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProductManagementPage() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: categories } = useCategories();
  const deleteProduct = useDeleteProduct();

  const categoryId = selectedCategory
    ? categories?.find((c) => c.slug === selectedCategory)?.id
    : undefined;

  const { data: result, isLoading, isError } = useProducts({
    search: search.trim(),
    categoryId,
    status: statusFilter === 'all' ? 'all' : statusFilter as ProductStatus,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
  });

  const products = result?.data ?? [];
  const totalCount = result?.count ?? 0;
  const totalPages = result?.totalPages ?? 1;

  const handleDelete = async (product: ProductWithCategory) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success(`"${product.name}" deleted`);
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Product Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your rental inventory — {totalCount} total products
          </p>
        </div>
        <button
          type="button"
          onClick={() => console.log('Add Product clicked — modal coming soon')}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-500 transition-all"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          <input
            type="text"
            placeholder="Search by name or slug…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full rounded-xl bg-surface-800 border border-white/5 pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
          className="rounded-xl bg-surface-800 border border-white/5 px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all cursor-pointer appearance-none min-w-[160px]"
          style={selectArrowStyle}
        >
          <option value="">All Categories</option>
          {(categories ?? []).map((cat) => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setCurrentPage(1); }}
          className="rounded-xl bg-surface-800 border border-white/5 px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all cursor-pointer appearance-none min-w-[140px]"
          style={selectArrowStyle}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-surface-800 border border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-white/5">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="h-10 w-10 skeleton rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 skeleton rounded" />
                  <div className="h-3 w-24 skeleton rounded" />
                </div>
                <div className="h-4 w-16 skeleton rounded" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Price/Day</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Qty</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((product, idx) => (
                    <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <ProductThumbnail name={product.name} index={idx} />
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate">{product.name}</p>
                            <p className="text-xs text-gray-500 truncate">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block rounded-full bg-surface-700 px-3 py-1 text-xs font-medium text-gray-300">{product.category.name}</span>
                      </td>
                      <td className="px-6 py-4 text-brand-400 font-medium">{formatCurrency(product.rental_price_per_day)}</td>
                      <td className="px-6 py-4 text-gray-300">{product.total_quantity}</td>
                      <td className="px-6 py-4"><StatusBadge status={product.status} /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" onClick={() => console.log('Edit:', product.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-all">
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDelete(product)} disabled={deleteProduct.isPending} className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-all">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-white/5">
              {products.map((product, idx) => (
                <div key={product.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <ProductThumbnail name={product.name} index={idx} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.slug}</p>
                        </div>
                        <StatusBadge status={product.status} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-sm">
                    <span className="rounded-full bg-surface-700 px-2.5 py-0.5 text-xs font-medium text-gray-300">{product.category.name}</span>
                    <span className="text-brand-400 font-medium">{formatCurrency(product.rental_price_per_day)}<span className="text-gray-500 font-normal">/day</span></span>
                    <span className="text-gray-400 text-xs">Qty: {product.total_quantity}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button type="button" onClick={() => console.log('Edit:', product.id)} className="flex-1 inline-flex items-center justify-center rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/5 transition-all">Edit</button>
                    <button type="button" onClick={() => handleDelete(product)} disabled={deleteProduct.isPending} className="flex-1 inline-flex items-center justify-center rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-all">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-700 mb-5">
              <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-white">No products found</h3>
            <p className="mt-2 text-sm text-gray-500">Try adjusting your search or filters.</p>
            {(search || selectedCategory || statusFilter !== 'all') && (
              <button type="button" onClick={() => { setSearch(''); setSelectedCategory(''); setStatusFilter('all'); setCurrentPage(1); }} className="mt-5 rounded-lg bg-surface-700 px-5 py-2 text-sm font-medium text-gray-300 hover:bg-surface-600 transition-colors">Clear Filters</button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalCount > ITEMS_PER_PAGE && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 px-6 py-4">
            <p className="text-xs text-gray-500">
              Showing <span className="text-gray-300 font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>–<span className="text-gray-300 font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}</span> of <span className="text-gray-300 font-medium">{totalCount}</span> products
            </p>
            <div className="flex items-center gap-1.5">
              <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="rounded-lg bg-surface-700 px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-surface-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} type="button" onClick={() => setCurrentPage(page)} className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-all', currentPage === page ? 'bg-brand-600 text-white' : 'bg-surface-700 text-gray-400 hover:bg-surface-600')}>{page}</button>
              ))}
              <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="rounded-lg bg-surface-700 px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-surface-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
