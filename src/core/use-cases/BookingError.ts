// ============================================================================
// BookingError
// Typed domain error for the booking flow. Carries a stable `code` so the UI
// can map failures to user-friendly messages (booking conflicts, invalid
// dates, validation errors, etc.) without string-matching.
// ============================================================================

export type BookingErrorCode =
  | 'INVALID_DATE_RANGE'
  | 'INVALID_QUANTITY'
  | 'PRODUCT_NOT_FOUND'
  | 'PRODUCT_INACTIVE'
  | 'INSUFFICIENT_AVAILABILITY'
  | 'INVALID_STATUS_TRANSITION'
  | 'BOOKING_NOT_FOUND'
  | 'REPOSITORY_ERROR';

export class BookingError extends Error {
  readonly code: BookingErrorCode;

  constructor(code: BookingErrorCode, message: string) {
    super(message);
    this.name = 'BookingError';
    this.code = code;
    // Restore prototype chain (required when targeting ES5/ES2015+ classes).
    Object.setPrototypeOf(this, BookingError.prototype);
  }

  /**
   * Map a Postgres/Supabase error whose message is prefixed with a known code
   * (e.g. "INSUFFICIENT_AVAILABILITY: only 3 unit(s) available...") into a
   * typed BookingError. Falls back to REPOSITORY_ERROR for everything else.
   */
  static fromPostgres(message: string): BookingError {
    const knownCodes: BookingErrorCode[] = [
      'INVALID_DATE_RANGE',
      'INVALID_QUANTITY',
      'PRODUCT_NOT_FOUND',
      'PRODUCT_INACTIVE',
      'INSUFFICIENT_AVAILABILITY',
    ];

    for (const code of knownCodes) {
      if (message.startsWith(code)) {
        const detail = message.slice(code.length).replace(/^[:\s]+/, '');
        return new BookingError(code, detail || message);
      }
    }

    return new BookingError('REPOSITORY_ERROR', message);
  }
}
