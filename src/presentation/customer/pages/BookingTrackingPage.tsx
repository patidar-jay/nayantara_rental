// ============================================================================
// BookingTrackingPage — Track booking by reference + phone
// ============================================================================

import { useState } from 'react';
import { useTrackBooking } from '@hooks';
import { formatCurrency, formatDate, cn } from '@utils';
import type { BookingStatus } from '@core/entities';

// ---------------------------------------------------------------------------
// Status Display Config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<BookingStatus, { label: string; emoji: string; color: string; bg: string }> = {
  pending:   { label: 'Pending Review',  emoji: '⏳', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  approved:  { label: 'Approved',        emoji: '✅', color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
  delivered: { label: 'Delivered',       emoji: '🚚', color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20' },
  returned:  { label: 'Returned',        emoji: '🔄', color: 'text-text-muted',   bg: 'bg-surface/10 border-border' },
  rejected:  { label: 'Rejected',        emoji: '❌', color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
  cancelled: { label: 'Cancelled',       emoji: '🚫', color: 'text-text-muted',   bg: 'bg-surface/10 border-border' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BookingTrackingPage() {
  const [refInput, setRefInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [searchRef, setSearchRef] = useState('');
  const [searchPhone, setSearchPhone] = useState('');

  const {
    data: booking,
    isLoading,
    isError,
    error,
  } = useTrackBooking(searchRef, searchPhone);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (refInput.trim() && phoneInput.trim()) {
      setSearchRef(refInput.trim().toUpperCase());
      setSearchPhone(phoneInput.trim());
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 sm:py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-text">Track Your Booking</h1>
          <p className="mt-3 text-text-muted">Enter your booking reference and phone number to check status.</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="rounded-2xl bg-surface p-6 space-y-4">
          <div>
            <label htmlFor="booking_ref" className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
              Booking Reference
            </label>
            <input
              id="booking_ref"
              type="text"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="e.g. NYT-LQ7X3A-4F9"
              className="w-full rounded-xl bg-surface border border-border px-4 py-2.5 text-sm text-text font-mono placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="6267178440"
              className="w-full rounded-xl bg-surface border border-border px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!refInput.trim() || !phoneInput.trim() || isLoading}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-text hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Searching...
              </>
            ) : (
              'Track Booking'
            )}
          </button>
        </form>

        {/* Results */}
        {submitted && !isLoading && (
          <div className="mt-8">
            {/* Error */}
            {isError && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 text-center">
                <p className="text-sm text-red-400">
                  {(error as Error)?.message ?? 'Booking not found. Please check your reference and phone number.'}
                </p>
              </div>
            )}

            {/* Booking Found */}
            {booking && (
              <div className="space-y-6">
                {/* Status Banner */}
                {(() => {
                  const config = STATUS_CONFIG[booking.status];
                  return (
                    <div className={cn('rounded-2xl border p-6 text-center', config.bg)}>
                      <span className="text-3xl block mb-2">{config.emoji}</span>
                      <p className={cn('text-lg font-semibold', config.color)}>{config.label}</p>
                    </div>
                  );
                })()}

                {/* Booking Details */}
                <div className="rounded-2xl bg-surface p-6">
                  <h3 className="text-base font-semibold text-text mb-4">Booking Details</h3>

                  <dl className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <dt className="text-text-muted">Reference</dt>
                      <dd className="text-primary font-mono font-medium">{booking.booking_ref}</dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-text-muted">Product</dt>
                      <dd className="text-text">{booking.product_name}</dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-text-muted">Dates</dt>
                      <dd className="text-text">{formatDate(booking.start_date)} → {formatDate(booking.end_date)}</dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-text-muted">Quantity</dt>
                      <dd className="text-text">{booking.quantity} unit(s)</dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-text-muted">Booked On</dt>
                      <dd className="text-text">{formatDate(booking.created_at)}</dd>
                    </div>
                    <div className="flex justify-between text-sm border-t border-border pt-3">
                      <dt className="text-text-muted font-semibold">Total Amount</dt>
                      <dd className="text-xl font-bold text-primary">{formatCurrency(booking.total_amount)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
