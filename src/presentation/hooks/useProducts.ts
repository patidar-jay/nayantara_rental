// ============================================================================
// useProducts — TanStack Query hooks for product data
//
// Provides reactive queries to fetch products from Supabase:
//   • useProducts()           → paginated list with filters
//   • useProduct(slug)        → single product with category + media
//   • useFeaturedProducts()   → homepage featured grid
//   • useProductsByCategory() → category-filtered listing
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@infrastructure/api/supabaseClient';
import type {
  Product,
  ProductDetail,
  ProductWithCategory,
  ProductInsert,
  ProductUpdate,
  ProductStatus,
} from '@core/entities';

// ---------------------------------------------------------------------------
// Query Keys — centralised for cache management
// ---------------------------------------------------------------------------

export const productKeys = {
  all:        ['products'] as const,
  lists:      () => [...productKeys.all, 'list'] as const,
  list:       (filters: Record<string, unknown>) => [...productKeys.lists(), filters] as const,
  details:    () => [...productKeys.all, 'detail'] as const,
  detail:     (slug: string) => [...productKeys.details(), slug] as const,
  featured:   () => [...productKeys.all, 'featured'] as const,
  byCategory: (categorySlug: string) => [...productKeys.all, 'category', categorySlug] as const,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  status?: ProductStatus | 'all';
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Fetch a paginated, filterable list of products with their categories.
 * Used by both the admin product management page and customer product listing.
 */
export function useProducts(filters: ProductFilters = {}) {
  const {
    search = '',
    categoryId,
    status = 'all',
    page = 1,
    pageSize = 12,
  } = filters;

  return useQuery({
    queryKey: productKeys.list({ search, categoryId, status, page, pageSize }),
    queryFn: async (): Promise<PaginatedResult<ProductWithCategory>> => {
      let query = supabase
        .from('products')
        .select(
          `*, category:categories ( id, name, slug )`,
          { count: 'exact' },
        )
        .order('sort_order', { ascending: true });

      // --- Filters ---
      if (search.trim()) {
        query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
      }
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      if (status !== 'all') {
        query = query.eq('status', status);
      }

      // --- Pagination ---
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw new Error(error.message);

      const totalCount = count ?? 0;
      return {
        data: (data ?? []) as ProductWithCategory[],
        count: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    },
  });
}

/**
 * Fetch a single product by its URL slug, with full detail
 * (category + media). Used by ProductDetailsPage.
 */
export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(slug ?? ''),
    queryFn: async (): Promise<ProductDetail> => {
      const { data, error } = await supabase
        .from('products')
        .select(`*, category:categories ( id, name, slug ), media:product_media ( * )`)
        .eq('slug', slug!)
        .single();

      if (error) throw new Error(error.message);
      return data as ProductDetail;
    },
    enabled: !!slug,
  });
}

/**
 * Fetch featured products for the homepage hero grid.
 */
export function useFeaturedProducts(limit = 6) {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: async (): Promise<ProductWithCategory[]> => {
      const { data, error } = await supabase
        .from('products')
        .select(`*, category:categories ( id, name, slug )`)
        .eq('is_featured', true)
        .eq('status', 'active')
        .order('sort_order', { ascending: true })
        .limit(limit);

      if (error) throw new Error(error.message);
      return (data ?? []) as ProductWithCategory[];
    },
  });
}

/**
 * Fetch all active products within a specific category (by slug).
 * Used by the customer-facing category pages.
 */
export function useProductsByCategory(categorySlug: string | undefined) {
  return useQuery({
    queryKey: productKeys.byCategory(categorySlug ?? ''),
    queryFn: async (): Promise<ProductWithCategory[]> => {
      // First resolve the category slug to its id
      const { data: category, error: catError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug!)
        .single();

      if (catError) throw new Error(catError.message);

      const { data, error } = await supabase
        .from('products')
        .select(`*, category:categories ( id, name, slug )`)
        .eq('category_id', category.id)
        .eq('status', 'active')
        .order('sort_order', { ascending: true });

      if (error) throw new Error(error.message);
      return (data ?? []) as ProductWithCategory[];
    },
    enabled: !!categorySlug,
  });
}

// ---------------------------------------------------------------------------
// Mutations (Admin)
// ---------------------------------------------------------------------------

/**
 * Create a new product. Invalidates product list cache on success.
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: ProductInsert): Promise<Product> => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

/**
 * Update an existing product. Invalidates both lists and the specific detail.
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ProductUpdate & { id: string }): Promise<Product> => {
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

/**
 * Delete a product. Invalidates product list cache on success.
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string): Promise<void> => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
