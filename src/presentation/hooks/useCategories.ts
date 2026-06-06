// ============================================================================
// useCategories — TanStack Query hooks for category data
//
// Provides reactive queries for categories:
//   • useCategories()       → all categories (active only by default)
//   • useAllCategories()    → all categories including inactive (admin)
//   • useCreateCategory()   → admin mutation
//   • useUpdateCategory()   → admin mutation
//   • useDeleteCategory()   → admin mutation
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@infrastructure/api/supabaseClient';
import type {
  Category,
  CategoryInsert,
  CategoryUpdate,
} from '@core/entities';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const categoryKeys = {
  all:    ['categories'] as const,
  active: () => [...categoryKeys.all, 'active'] as const,
  admin:  () => [...categoryKeys.all, 'admin'] as const,
};

// ---------------------------------------------------------------------------
// Hooks — Queries
// ---------------------------------------------------------------------------

/**
 * Fetch active categories only. Used by customer-facing pages
 * (navigation, product listing filter, homepage grid).
 */
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.active(),
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw new Error(error.message);
      return (data ?? []) as Category[];
    },
  });
}

/**
 * Fetch all categories including inactive ones.
 * Used by the admin category management page.
 */
export function useAllCategories() {
  return useQuery({
    queryKey: categoryKeys.admin(),
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw new Error(error.message);
      return (data ?? []) as Category[];
    },
  });
}

// ---------------------------------------------------------------------------
// Hooks — Mutations (Admin)
// ---------------------------------------------------------------------------

/**
 * Create a new category.
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: CategoryInsert): Promise<Category> => {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

/**
 * Update an existing category.
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: CategoryUpdate & { id: string }): Promise<Category> => {
      const { data, error } = await supabase
        .from('categories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

/**
 * Delete a category.
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string): Promise<void> => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}
