// ============================================================================
// BookingService
// Core booking business logic. Backend-agnostic: depends only on the
// IBookingRepository abstraction and the domain entities.
//
// Responsibilities:
//   * Validate requested dates & quantity
//   * Compute rental days / totals (preview only — server is authoritative)
//   * Check availability via the repository to PREVENT OVERBOOKING
//   * Create bookings (always starting in `pending`)
//   * Enforce the booking status workflow
// ============================================================================

import type {
  Product,
  Booking,
  BookingDetail,
  BookingStatus,
  AvailabilityResult,
  CustomerInsert,
} from '@core/entities';
import type { IBookingRepository } from '@infrastructure/repositories/IBookingRepository';
import { BookingError } from './BookingError';

// ----------------------------------------------------------------------------
// Public request / result shapes
// ----------------------------------------------------------------------------

export interface CreateBookingRequest {
  product: Product;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  quantity: number;
  customer: CustomerInsert;
  notes?: string | null;
}

export interface RentalSummary {
  totalDays: number;
  pricePerDay: number;
  quantity: number;
  totalAmount: number;
}

// ----------------------------------------------------------------------------
// Status workflow
//
//   pending   -> approved | rejected | cancelled
//   approved  -> delivered | cancelled
//   delivered -> returned
//   rejected / returned / cancelled -> (terminal)
//
// Customer cancellation is only permitted before approval (i.e. from pending).
// ----------------------------------------------------------------------------

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['approved', 'rejected', 'cancelled'],
  approved: ['delivered', 'cancelled'],
  delivered: ['returned'],
  rejected: [],
  returned: [],
  cancelled: [],
};

export class BookingService {
  private readonly repository: IBookingRepository;

  constructor(repository: IBookingRepository) {
    this.repository = repository;
  }

  // --------------------------------------------------------------------------
  // Pure helpers
  // --------------------------------------------------------------------------

  /** Inclusive rental-day count (e.g. 2026-07-01 -> 2026-07-01 == 1 day). */
  static calculateTotalDays(startDate: string, endDate: string): number {
    const start = BookingService.parseDate(startDate);
    const end = BookingService.parseDate(endDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((end.getTime() - start.getTime()) / msPerDay) + 1;
  }

  /** Preview summary. The server recomputes authoritative totals on create. */
  static calculateSummary(
    pricePerDay: number,
    startDate: string,
    endDate: string,
    quantity: number,
  ): RentalSummary {
    const totalDays = BookingService.calculateTotalDays(startDate, endDate);
    return {
      totalDays,
      pricePerDay,
      quantity,
      totalAmount: pricePerDay * quantity * totalDays,
    };
  }

  /** Generate a unique, human-friendly booking reference (e.g. NYT-LQ7X3A-4F9). */
  static generateBookingRef(): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
    const pick = (n: number): string =>
      Array.from({ length: n }, () =>
        alphabet.charAt(Math.floor(Math.random() * alphabet.length)),
      ).join('');
    const time = Date.now().toString(36).toUpperCase().slice(-6);
    return `NYT-${time}-${pick(3)}`;
  }

  // --------------------------------------------------------------------------
  // Availability
  // --------------------------------------------------------------------------

  async checkAvailability(
    productId: string,
    startDate: string,
    endDate: string,
    requestedQuantity = 1,
  ): Promise<AvailabilityResult> {
    BookingService.assertValidDateRange(startDate, endDate);
    BookingService.assertValidQuantity(requestedQuantity);

    return this.repository.checkAvailability(
      { product_id: productId, start_date: startDate, end_date: endDate },
      requestedQuantity,
    );
  }

  // --------------------------------------------------------------------------
  // Create
  // --------------------------------------------------------------------------

  async createBooking(request: CreateBookingRequest): Promise<BookingDetail> {
    const { product, startDate, endDate, quantity, customer, notes } = request;

    // 1. Fail fast on invalid input (good UX; DB also enforces these).
    BookingService.assertValidDateRange(startDate, endDate);
    BookingService.assertValidQuantity(quantity);

    if (product.status !== 'active') {
      throw new BookingError(
        'PRODUCT_INACTIVE',
        'This product is not currently available for booking',
      );
    }

    // 2. Pre-flight availability check to prevent overbooking before we write.
    //    (The create_booking RPC re-checks atomically under a row lock, so this
    //    is primarily for fast, friendly feedback.)
    const available = await this.repository.getAvailableQuantity({
      product_id: product.id,
      start_date: startDate,
      end_date: endDate,
    });

    if (available < quantity) {
      throw new BookingError(
        'INSUFFICIENT_AVAILABILITY',
        `Only ${available} unit(s) available for the selected dates`,
      );
    }

    // 3. Create atomically with retry for booking ref collisions.
    //    New bookings always start as `pending`.
    const MAX_REF_RETRIES = 3;
    for (let attempt = 0; attempt < MAX_REF_RETRIES; attempt++) {
      try {
        return await this.repository.createBooking({
          customer,
          booking_ref: BookingService.generateBookingRef(),
          product_id: product.id,
          start_date: startDate,
          end_date: endDate,
          quantity,
          notes: notes ?? null,
        });
      } catch (err) {
        if (
          err instanceof BookingError &&
          err.code === 'DUPLICATE_BOOKING_REF' &&
          attempt < MAX_REF_RETRIES - 1
        ) {
          // Retry with a new reference
          continue;
        }
        throw err;
      }
    }

    // Unreachable, but satisfies TypeScript
    throw new BookingError(
      'REPOSITORY_ERROR',
      'Failed to generate a unique booking reference after multiple attempts',
    );
  }

  // --------------------------------------------------------------------------
  // Lookup
  // --------------------------------------------------------------------------

  async getBooking(bookingId: string): Promise<BookingDetail> {
    const booking = await this.repository.getBookingById(bookingId);
    if (!booking) {
      throw new BookingError('BOOKING_NOT_FOUND', 'Booking does not exist');
    }
    return booking;
  }

  async getBookingByRef(bookingRef: string): Promise<BookingDetail> {
    const booking = await this.repository.getBookingByRef(bookingRef);
    if (!booking) {
      throw new BookingError('BOOKING_NOT_FOUND', 'Booking does not exist');
    }
    return booking;
  }

  // --------------------------------------------------------------------------
  // Status workflow
  // --------------------------------------------------------------------------

  static canTransition(from: BookingStatus, to: BookingStatus): boolean {
    return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
  }

  /** Generic guarded transition used by all admin/customer status actions. */
  async transitionStatus(
    bookingId: string,
    nextStatus: BookingStatus,
  ): Promise<Booking> {
    const current = await this.repository.getBookingById(bookingId);
    if (!current) {
      throw new BookingError('BOOKING_NOT_FOUND', 'Booking does not exist');
    }

    if (current.status === nextStatus) {
      return current;
    }

    if (!BookingService.canTransition(current.status, nextStatus)) {
      throw new BookingError(
        'INVALID_STATUS_TRANSITION',
        `Cannot change booking status from "${current.status}" to "${nextStatus}"`,
      );
    }

    return this.repository.updateBookingStatus(bookingId, nextStatus);
  }

  // Admin actions ------------------------------------------------------------
  approveBooking(bookingId: string): Promise<Booking> {
    return this.transitionStatus(bookingId, 'approved');
  }

  rejectBooking(bookingId: string): Promise<Booking> {
    return this.transitionStatus(bookingId, 'rejected');
  }

  markDelivered(bookingId: string): Promise<Booking> {
    return this.transitionStatus(bookingId, 'delivered');
  }

  markReturned(bookingId: string): Promise<Booking> {
    return this.transitionStatus(bookingId, 'returned');
  }

  // Customer action ----------------------------------------------------------
  /** Customers may only cancel while the booking is still pending. */
  cancelBooking(bookingId: string): Promise<Booking> {
    return this.transitionStatus(bookingId, 'cancelled');
  }

  // --------------------------------------------------------------------------
  // Validation helpers
  // --------------------------------------------------------------------------

  private static parseDate(value: string): Date {
    // Treat YYYY-MM-DD as a UTC calendar date to avoid timezone drift.
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) {
      throw new BookingError('INVALID_DATE_RANGE', `Invalid date: "${value}"`);
    }
    return date;
  }

  private static assertValidDateRange(startDate: string, endDate: string): void {
    const start = BookingService.parseDate(startDate);
    const end = BookingService.parseDate(endDate);
    if (end.getTime() < start.getTime()) {
      throw new BookingError(
        'INVALID_DATE_RANGE',
        'End date must be on or after the start date',
      );
    }
  }

  private static assertValidQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BookingError(
        'INVALID_QUANTITY',
        'Quantity must be a whole number greater than zero',
      );
    }
  }
}
