// ============================================================================
// IBookingRepository
// Abstraction over the persistence layer for the booking domain.
//
// The core BookingService depends ONLY on this interface, never on Supabase
// directly. This keeps business logic backend-agnostic and lets us swap the
// implementation (Supabase -> custom API / Postgres) without touching use-cases.
// ============================================================================

import type {
  Product,
  AvailabilityCheck,
  AvailabilityResult,
  BookingStatus,
  Booking,
  BookingDetail,
  CustomerInsert,
} from '@core/entities';

/**
 * Input for creating a single-product booking. Customer is upserted, the
 * booking is created in `pending`, and one booking_item line is recorded —
 * all atomically and with a server-side overbooking guard.
 */
export interface CreateBookingInput {
  customer: CustomerInsert;
  booking_ref: string;
  product_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  quantity: number;
  notes?: string | null;
}

export interface IBookingRepository {
  /** Fetch a single product (or null if it does not exist). */
  getProductById(productId: string): Promise<Product | null>;

  /**
   * Authoritative, server-side available quantity for the requested window.
   * Backed by the `get_available_quantity` SQL function.
   */
  getAvailableQuantity(check: AvailabilityCheck): Promise<number>;

  /**
   * Convenience availability snapshot for a product/date-range, optionally
   * evaluated against a requested quantity.
   */
  checkAvailability(
    check: AvailabilityCheck,
    requestedQuantity?: number,
  ): Promise<AvailabilityResult>;

  /**
   * Atomically create customer + booking + booking_item with a server-side
   * overbooking guard. Returns the fully hydrated booking. Throws BookingError
   * on validation / availability failures.
   */
  createBooking(input: CreateBookingInput): Promise<BookingDetail>;

  /** Fetch a fully-hydrated booking by id (or null). */
  getBookingById(bookingId: string): Promise<BookingDetail | null>;

  /** Fetch a fully-hydrated booking by its public reference (or null). */
  getBookingByRef(bookingRef: string): Promise<BookingDetail | null>;

  /** Persist a booking status change. Returns the updated booking row. */
  updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking>;
}
