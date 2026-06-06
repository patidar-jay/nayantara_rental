// ============================================================================
// useInventory — TanStack Query hooks for real-time availability
//
// Provides reactive queries that call the `get_available_quantity` Postgres
// RPC function to check how many units of a product are bookable for a
// given date range.
//
//   • useAvailability()   → full AvailabilityResult for a product/date range
//   • useAvailableQty()   → raw integer count (lightweight alternative)
// ============================================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@infrastructure/api/supabaseClient';
import { SupabaseBookingRepository } from '@infrastructure/repositories/SupabaseBookingRepository';
import type { AvailabilityResult } from '@core/entities';

// ---------------------------------------------------------------------------
// Singleton repository for availability checks
// ---------------------------------------------------------------------------

const repository = new SupabaseBookingRepository(supabase);

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const inventoryKeys = {
  all:          ['inventory'] as const,
  availability: (productId: string, startDate: string, endDate: string) =>
    [...inventoryKeys.all, 'availability', productId, startDate, endDate] as const,
  quantity:      (productId: string, startDate: string, endDate: string) =>
    [...inventoryKeys.all, 'qty', productId, startDate, endDate] as const,
  calendar:      (productId: string, year: number, month: number) =>
    [...inventoryKeys.all, 'calendar', productId, year, month] as const,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AvailabilityParams {
  productId: string;
  startDate: string;  // YYYY-MM-DD
  endDate: string;    // YYYY-MM-DD
  requestedQuantity?: number;
}

export interface CalendarDay {
  date: string;       // YYYY-MM-DD
  totalQuantity: number;
  bookedQuantity: number;
  availableQuantity: number;
  status: 'available' | 'partial' | 'full';
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Check full availability for a product within a date range.
 * Returns an AvailabilityResult with total, booked, and available quantities
 * plus a boolean `is_available` flag.
 *
 * Uses the repository's `checkAvailability` method which internally calls
 * the `get_available_quantity` Postgres function.
 *
 * Only fires when all parameters are truthy — set enabled externally or
 * pass empty strings to disable.
 */
export function useAvailability(params: AvailabilityParams | null) {
  const productId = params?.productId ?? '';
  const startDate = params?.startDate ?? '';
  const endDate   = params?.endDate ?? '';
  const qty       = params?.requestedQuantity ?? 1;

  return useQuery({
    queryKey: inventoryKeys.availability(productId, startDate, endDate),
    queryFn: async (): Promise<AvailabilityResult> => {
      return repository.checkAvailability(
        { product_id: productId, start_date: startDate, end_date: endDate },
        qty,
      );
    },
    enabled: !!productId && !!startDate && !!endDate,
    staleTime: 15 * 1000,  // availability data is fresh for 15s
    gcTime: 60 * 1000,     // keep in cache for 1 min
  });
}

/**
 * Lightweight hook returning just the raw available quantity integer.
 * Calls the `get_available_quantity` RPC directly for minimal overhead.
 *
 * Useful for quick availability badges/indicators where you don't need
 * the full AvailabilityResult.
 */
export function useAvailableQty(
  productId: string | undefined,
  startDate: string | undefined,
  endDate: string | undefined,
) {
  return useQuery({
    queryKey: inventoryKeys.quantity(productId ?? '', startDate ?? '', endDate ?? ''),
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase.rpc('get_available_quantity', {
        p_product_id: productId!,
        p_start_date: startDate!,
        p_end_date: endDate!,
      });

      if (error) throw new Error(error.message);
      return Number(data ?? 0);
    },
    enabled: !!productId && !!startDate && !!endDate,
    staleTime: 15 * 1000,
    gcTime: 60 * 1000,
  });
}

/**
 * Fetch day-by-day availability for a product across an entire month.
 * Used by the admin AvailabilityCalendar page.
 *
 * Calls `get_available_quantity` for each day individually — in production
 * this should be replaced with a batch RPC for performance, but this works
 * correctly for the current scope.
 */
export function useMonthlyAvailability(
  productId: string | undefined,
  totalQuantity: number,
  year: number,
  month: number, // 0-indexed (JS Date convention)
) {
  return useQuery({
    queryKey: inventoryKeys.calendar(productId ?? '', year, month),
    queryFn: async (): Promise<CalendarDay[]> => {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const days: CalendarDay[] = [];

      // Batch all RPC calls in parallel for performance
      const promises = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        return supabase
          .rpc('get_available_quantity', {
            p_product_id: productId!,
            p_start_date: dateStr,
            p_end_date: dateStr,
          })
          .then(({ data, error }) => {
            if (error) throw new Error(error.message);
            const available = Number(data ?? 0);
            const booked = totalQuantity - available;

            let status: CalendarDay['status'] = 'available';
            if (available <= 0) status = 'full';
            else if (booked > 0) status = 'partial';

            return {
              date: dateStr,
              totalQuantity,
              bookedQuantity: booked,
              availableQuantity: available,
              status,
            } satisfies CalendarDay;
          });
      });

      const results = await Promise.all(promises);
      return results;
    },
    enabled: !!productId && totalQuantity > 0,
    staleTime: 60 * 1000, // calendar data is fresh for 1 min
  });
}
