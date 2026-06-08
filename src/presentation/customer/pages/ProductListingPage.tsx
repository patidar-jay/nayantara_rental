// ============================================================================
// ProductListingPage — Matches reference image 4
// Search + Filter pills + 3-col grid + Pagination
// ============================================================================

import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts, useCategories } from '@hooks';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { cn } from '@utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ITEMS_PER_PAGE = 12;

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name', value: 'name' },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') ?? '');
  const [currentPage, setCurrentPage] = useState(1);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const { data: categories } = useCategories();

  // Resolve slug → category ID for the hook
  const selectedCategoryId = useMemo(() => {
    if (!selectedCategory || !categories) return undefined;
    return categories.find(c => c.slug === selectedCategory)?.id;
  }, [selectedCategory, categories]);

  const { data: result, isLoading } = useProducts({
    search: search.trim(),
    categoryId: selectedCategoryId,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
  });

  const products = result?.data ?? [];
  const totalCount = result?.count ?? 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleCategoryChange = (slug: string) => {
    const next = selectedCategory === slug ? '' : slug;
    setSelectedCategory(next);
    setCurrentPage(1);
    if (next) {
      setSearchParams({ category: next });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Search Bar */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 max-w-7xl mx-auto">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search for outfits, categories..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full rounded-xl bg-surface border border-border pl-11 pr-12 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-primary"
            aria-label="Filters"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter / Sort / Category Pills */}
      <div className="px-4 sm:px-6 lg:px-8 mt-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {/* Sort dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1.5 rounded-full bg-surface border border-border px-4 py-2 text-xs font-medium text-text-muted hover:text-text transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
              </svg>
              Sort
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                <div className="absolute left-0 top-full mt-1 z-20 w-48 rounded-xl bg-surface border border-border shadow-2xl py-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                      className={cn(
                        'w-full text-left px-4 py-2.5 text-xs transition-colors',
                        sortBy === opt.value ? 'text-primary bg-primary/5' : 'text-text-muted hover:text-text hover:bg-background'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Category pills */}
          <button
            type="button"
            onClick={() => handleCategoryChange('')}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-medium transition-colors shrink-0',
              selectedCategory === ''
                ? 'bg-primary text-background'
                : 'bg-surface border border-border text-text-muted hover:text-text'
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
                'rounded-full px-4 py-2 text-xs font-medium transition-colors shrink-0',
                selectedCategory === cat.slug
                  ? 'bg-primary text-background'
                  : 'bg-surface border border-border text-text-muted hover:text-text'
              )}
            >
              {cat.name}
            </button>
          ))}

          {selectedCategory && (
            <button
              type="button"
              onClick={() => handleCategoryChange('')}
              className="flex items-center gap-1 rounded-full border border-red-500/20 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="px-4 sm:px-6 lg:px-8 mt-5 max-w-7xl mx-auto">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-text">
              {selectedCategory
                ? (categories ?? []).find(c => c.slug === selectedCategory)?.name ?? 'Products'
                : 'All Outfits'}
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Showing {products.length > 0 ? `1–${Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}` : '0'} of {totalCount} outfits
            </p>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-4 sm:px-6 lg:px-8 mt-4 max-w-7xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <svg className="h-16 w-16 text-text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <h3 className="text-lg font-heading font-semibold text-text">No outfits found</h3>
            <p className="text-sm text-text-muted mt-2">Try adjusting your filters or search.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 sm:px-6 lg:px-8 mt-8 mb-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="flex items-center justify-center h-9 w-9 rounded-lg bg-surface border border-border text-text-muted disabled:opacity-30 hover:text-text transition-colors"
              aria-label="Previous page"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'flex items-center justify-center h-9 w-9 rounded-lg text-xs font-medium transition-colors',
                  currentPage === page
                    ? 'bg-primary text-background'
                    : 'bg-surface border border-border text-text-muted hover:text-text'
                )}
              >
                {page}
              </button>
            ))}
            {totalPages > 5 && (
              <>
                <span className="text-text-muted text-xs px-1">...</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  className={cn(
                    'flex items-center justify-center h-9 w-9 rounded-lg text-xs font-medium transition-colors',
                    currentPage === totalPages
                      ? 'bg-primary text-background'
                      : 'bg-surface border border-border text-text-muted hover:text-text'
                  )}
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="flex items-center justify-center h-9 w-9 rounded-lg bg-surface border border-border text-text-muted disabled:opacity-30 hover:text-text transition-colors"
              aria-label="Next page"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
