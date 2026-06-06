// ============================================================================
// useBookings — TanStack Query hooks for booking data
//
// Provides reactive queries and mutations for the booking lifecycle:
//   • useAdminBookings()          → paginated admin table with status filter
//   • useBookingByRef()           → customer tracking lookup
//   • useCreateBooking()          → full booking creation mutation
//   • useUpdateBookingStatus()    → admin status transition mutation
//   • useDashboardStats()         → aggregate counts for the admin dashboard
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@infrastructure/api/supabaseClient';
import { SupabaseBookingRepository } from '@infrastructure/repositories/SupabaseBookingRepository';
import { BookingService } from '@core/use-cases/BookingService';
import type {
  BookingDetail,
  BookingStatus,
  Product,
  CustomerInsert,
} from '@core/entities';
import type { CreateBookingRequest } from '@core/use-cases/BookingService';

// ---------------------------------------------------------------------------
// Singleton instances — shared across hooks
// ---------------------------------------------------------------------------

const repository = new SupabaseBookingRepository(supabase);
const bookingService = new BookingService(repository);

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const bookingKeys = {
  all:       ['bookings'] as const,
  lists:     () => [...bookingKeys.all, 'list'] as const,
  list:      (filters: Record<string, unknown>) => [...bookingKeys.lists(), filters] as const,
  detail:    (id: string) => [...bookingKeys.all, 'detail', id] as const,
  byRef:     (ref: string) => [...bookingKeys.all, 'ref', ref] as const,
  tracking:  (ref: string, phone: string) => [...bookingKeys.all, 'track', ref, phone] as const,
  dashboard: () => [...bookingKeys.all, 'dashboard'] as const,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BookingFilters {
  status?: BookingStatus | 'all';
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedBookings {
  data: BookingDetail[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  activeRentals: number; // delivered
  totalCustomers: number;
  monthlyRevenue: number;
}

// ---------------------------------------------------------------------------
// Supabase nested-select for BookingDetail
// ---------------------------------------------------------------------------

const BOOKING_DETAIL_SELECT = `
  *,
  customer:customers ( id, full_name, phone, email, address ),
  items:booking_items (
    *,
    product:products ( id, name, slug, rental_price_per_day )
  )
` as const;

// ---------------------------------------------------------------------------
// Hooks — Queries
// ---------------------------------------------------------------------------

/**
 * Fetch a paginated list of bookings for the admin booking management table.
 * Supports filtering by status and searching by booking_ref or customer name.
 */
export function useAdminBookings(filters: BookingFilters = {}) {
  const {
    status = 'all',
    search = '',
    page = 1,
    pageSize = 10,
  } = filters;

  return useQuery({
    queryKey: bookingKeys.list({ status, search, page, pageSize }),
    queryFn: async (): Promise<PaginatedBookings> => {
      let query = supabase
        .from('bookings')
        .select(BOOKING_DETAIL_SELECT, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Status filter
      if (status !== 'all') {
        query = query.eq('status', status);
      }

      // Search: we'll search by booking_ref since nested customer search
      // isn't easily done via PostgREST. Full-text search is a future upgrade.
      if (search.trim()) {
        query = query.ilike('booking_ref', `%${search}%`);
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw new Error(error.message);

      const totalCount = count ?? 0;
      return {
        data: (data ?? []) as BookingDetail[],
        count: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    },
  });
}

/**
 * Fetch a single booking by its public reference code.
 * Used by the customer booking tracking page.
 */
export function useBookingByRef(bookingRef: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.byRef(bookingRef ?? ''),
    queryFn: async (): Promise<BookingDetail> => {
      return bookingService.getBookingByRef(bookingRef!);
    },
    enabled: !!bookingRef,
    retry: false,
  });
}

/**
 * Track a booking by reference + phone number for customer verification.
 * Returns the booking only if the phone matches.
 */
export function useTrackBooking(bookingRef: string, phone: string) {
  return useQuery({
    queryKey: bookingKeys.tracking(bookingRef, phone),
    queryFn: async (): Promise<BookingDetail | null> => {
      const { data, error } = await supabase
        .from('bookings')
        .select(BOOKING_DETAIL_SELECT)
        .eq('booking_ref', bookingRef)
        .single();

      if (error) throw new Error(error.message);

      const booking = data as BookingDetail;

      // Verify phone matches the customer on this booking
      if (booking.customer.phone !== phone) {
        throw new Error('Phone number does not match this booking');
      }

      return booking;
    },
    enabled: !!bookingRef && !!phone,
    retry: false,
  });
}

/**
 * Aggregate dashboard statistics for the admin overview.
 * Fetches counts from multiple tables in parallel.
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: bookingKeys.dashboard(),
    queryFn: async (): Promise<DashboardStats> => {
      // Fire all count queries in parallel
      const [
        productsRes,
        categoriesRes,
        bookingsRes,
        pendingRes,
        approvedRes,
        deliveredRes,
        customersRes,
        revenueRes,
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'delivered'),
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        // Monthly revenue: sum total_amount for returned bookings this month
        supabase
          .from('bookings')
          .select('total_amount')
          .in('status', ['returned', 'delivered'])
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      ]);

      // Calculate monthly revenue from returned/delivered bookings
      const monthlyRevenue = (revenueRes.data ?? []).reduce(
        (sum: number, row: { total_amount: number }) => sum + (row.total_amount ?? 0),
        0,
      );

      return {
        totalProducts: productsRes.count ?? 0,
        totalCategories: categoriesRes.count ?? 0,
        totalBookings: bookingsRes.count ?? 0,
        pendingBookings: pendingRes.count ?? 0,
        approvedBookings: approvedRes.count ?? 0,
        activeRentals: deliveredRes.count ?? 0,
        totalCustomers: customersRes.count ?? 0,
        monthlyRevenue,
      };
    },
    staleTime: 30 * 1000, // refresh every 30s for dashboard
  });
}

// ---------------------------------------------------------------------------
// Hooks — Mutations
// ---------------------------------------------------------------------------

/**
 * Create a new booking using the BookingService (which validates
 * dates/quantity, pre-checks availability, then calls the atomic
 * create_booking RPC).
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateBookingRequest): Promise<BookingDetail> => {
      return bookingService.createBooking(request);
    },
    onSuccess: () => {
      // Invalidate all booking-related caches
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

/**
 * Transition a booking to a new status using the BookingService's
 * guarded workflow (validates allowed transitions).
 */
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: BookingStatus;
    }) => {
      return bookingService.transitionStatus(bookingId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Re-export service utilities for UI convenience
// ---------------------------------------------------------------------------

export { BookingService } from '@core/use-cases/BookingService';
