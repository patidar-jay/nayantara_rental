// ============================================================================
// SupabaseBookingRepository
// Supabase-backed implementation of IBookingRepository.
//
// Availability and booking creation are delegated to SQL functions
// (get_available_quantity / create_booking) so the authoritative inventory
// logic lives server-side and is safe under concurrency.
// ============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Product,
  Booking,
  BookingDetail,
  BookingStatus,
  AvailabilityCheck,
  AvailabilityResult,
} from '@core/entities';
import type { IBookingRepository, CreateBookingInput } from './IBookingRepository';
import { BookingError } from '@core/use-cases/BookingError';

// Supabase nested-select projection for a fully hydrated booking.
const BOOKING_DETAIL_SELECT = `
  *,
  customer:customers ( id, full_name, phone, email, address ),
  items:booking_items (
    *,
    product:products ( id, name, slug, rental_price_per_day )
  )
` as const;

export class SupabaseBookingRepository implements IBookingRepository {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async getProductById(productId: string): Promise<Product | null> {
    const { data, error } = await this.client
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();

    if (error) {
      throw new BookingError('REPOSITORY_ERROR', error.message);
    }
    return (data as Product | null) ?? null;
  }

  async getAvailableQuantity(check: AvailabilityCheck): Promise<number> {
    const { data, error } = await this.client.rpc('get_available_quantity', {
      p_product_id: check.product_id,
      p_start_date: check.start_date,
      p_end_date: check.end_date,
    });

    if (error) {
      throw BookingError.fromPostgres(error.message);
    }
    return Number(data ?? 0);
  }

  async checkAvailability(
    check: AvailabilityCheck,
    requestedQuantity = 1,
  ): Promise<AvailabilityResult> {
    const product = await this.getProductById(check.product_id);
    if (!product) {
      throw new BookingError('PRODUCT_NOT_FOUND', 'Product does not exist');
    }

    const available = await this.getAvailableQuantity(check);

    return {
      product_id: check.product_id,
      total_quantity: product.total_quantity,
      max_booked_quantity: product.total_quantity - available,
      available_quantity: available,
      is_available: available >= requestedQuantity,
    };
  }

  async createBooking(input: CreateBookingInput): Promise<BookingDetail> {
    const { data, error } = await this.client.rpc('create_booking', {
      p_full_name: input.customer.full_name,
      p_phone: input.customer.phone,
      p_email: input.customer.email ?? null,
      p_address: input.customer.address,
      p_booking_ref: input.booking_ref,
      p_product_id: input.product_id,
      p_start_date: input.start_date,
      p_end_date: input.end_date,
      p_quantity: input.quantity,
      p_notes: input.notes ?? null,
    });

    if (error) {
      throw BookingError.fromPostgres(error.message);
    }

    const bookingId = data as string;

    // Use the SECURITY DEFINER RPC to fetch the full booking detail.
    // The anon user cannot do a direct SELECT on bookings/customers/booking_items
    // due to RLS, so we use get_booking_detail() which bypasses RLS.
    const booking = await this.getBookingDetailViaRpc(bookingId);
    if (!booking) {
      throw new BookingError(
        'REPOSITORY_ERROR',
        'Booking was created but could not be retrieved',
      );
    }
    return booking;
  }

  /**
   * Fetch a fully hydrated booking detail via the get_booking_detail()
   * SECURITY DEFINER RPC. Safe for anon callers (bypasses RLS).
   */
  private async getBookingDetailViaRpc(bookingId: string): Promise<BookingDetail | null> {
    const { data, error } = await this.client.rpc('get_booking_detail', {
      p_booking_id: bookingId,
    });

    if (error) {
      throw new BookingError('REPOSITORY_ERROR', error.message);
    }

    if (!data) return null;
    return data as BookingDetail;
  }

  async getBookingById(bookingId: string): Promise<BookingDetail | null> {
    const { data, error } = await this.client
      .from('bookings')
      .select(BOOKING_DETAIL_SELECT)
      .eq('id', bookingId)
      .maybeSingle();

    if (error) {
      throw new BookingError('REPOSITORY_ERROR', error.message);
    }
    return (data as BookingDetail | null) ?? null;
  }

  async getBookingByRef(bookingRef: string): Promise<BookingDetail | null> {
    const { data, error } = await this.client
      .from('bookings')
      .select(BOOKING_DETAIL_SELECT)
      .eq('booking_ref', bookingRef)
      .maybeSingle();

    if (error) {
      throw new BookingError('REPOSITORY_ERROR', error.message);
    }
    return (data as BookingDetail | null) ?? null;
  }

  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
  ): Promise<Booking> {
    const { data, error } = await this.client
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select('*')
      .maybeSingle();

    if (error) {
      throw new BookingError('REPOSITORY_ERROR', error.message);
    }
    if (!data) {
      throw new BookingError('BOOKING_NOT_FOUND', 'Booking does not exist');
    }
    return data as Booking;
  }
}
