// ============================================================================
// ProductListingPage — Full product catalog with search, filter, sort
// ============================================================================

import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts, useCategories } from '@hooks';
import type { ProductFilters } from '@hooks';
import type { ProductStatus } from '@core/entities';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeletonGrid } from '../components/ProductCardSkeleton';
import { cn } from '@utils';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') ?? '';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);

  const { data: categories } = useCategories();

  // Find category ID from slug
  const categoryId = selectedCategory
    ? categories?.find((c) => c.slug === selectedCategory)?.id
    : undefined;

  const filters: ProductFilters = {
    search: search.trim(),
    categoryId,
    status: 'active' as ProductStatus | 'all',
    page,
    pageSize: 12,
  };

  const { data: result, isLoading, isError, error } = useProducts(filters);

  const handleCategoryChange = useCallback((slug: string) => {
    setSelectedCategory(slug);
    setPage(1);
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  }, [setSearchParams]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-surface-950 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">All Equipment</h1>
          <p className="mt-2 text-gray-500">
            {result ? `${result.count} products available` : 'Browse our full catalog'}
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search equipment..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-xl bg-surface-800 border border-white/5 pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
            />
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            type="button"
            onClick={() => handleCategoryChange('')}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-medium transition-all',
              !selectedCategory
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                : 'bg-surface-800 text-gray-400 hover:bg-surface-700 hover:text-white'
            )}
          >
            All
          </button>
          {(categories ?? []).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.slug)}
              className={cn(
                'rounded-full px-4 py-2 text-xs font-medium transition-all',
                selectedCategory === cat.slug
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                  : 'bg-surface-800 text-gray-400 hover:bg-surface-700 hover:text-white'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Error State */}
        {isError && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 text-center">
            <p className="text-sm text-red-400">{(error as Error)?.message ?? 'Failed to load products'}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <ProductCardSkeletonGrid count={6} />}

        {/* Product Grid */}
        {!isLoading && !isError && result && (
          <>
            {result.data.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-800 mb-4">
                  <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">No products found</h3>
                <p className="mt-2 text-sm text-gray-500">Try adjusting your search or filters.</p>
                {(search || selectedCategory) && (
                  <button
                    type="button"
                    onClick={() => { setSearch(''); handleCategoryChange(''); }}
                    className="mt-4 rounded-lg bg-surface-800 px-5 py-2 text-sm font-medium text-gray-300 hover:bg-surface-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {result.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg bg-surface-800 px-4 py-2 text-xs font-medium text-gray-400 hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Previous
                </button>
                {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={cn(
                      'rounded-lg px-3 py-2 text-xs font-medium transition-all',
                      page === p
                        ? 'bg-brand-600 text-white'
                        : 'bg-surface-800 text-gray-400 hover:bg-surface-700'
                    )}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={page === result.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg bg-surface-800 px-4 py-2 text-xs font-medium text-gray-400 hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
