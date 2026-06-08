// ============================================================================
// BookingTrackingPage — Matches reference image 8-9
// Search form + Status Guide + Recent Booking display + Booking Details
// ============================================================================

import { useState } from 'react';
import { useTrackBooking } from '@hooks';
import { useToast } from '@presentation/shared/Toast';
import { formatCurrency, cn } from '@utils';

// ---------------------------------------------------------------------------
// Status Steps
// ---------------------------------------------------------------------------

const STATUS_FLOW = [
  { key: 'confirmed', label: 'Confirmed', desc: 'Your booking is confirmed' },
  { key: 'approved', label: 'Preparing', desc: 'We are preparing your outfit' },
  { key: 'delivered', label: 'Out for Delivery', desc: 'Your outfit is on the way' },
  { key: 'returned', label: 'Delivered', desc: 'Enjoy your special outfit!' },
] as const;

function getStatusIndex(status: string): number {
  const map: Record<string, number> = {
    pending: 0, confirmed: 0, approved: 1, delivered: 2, returned: 3,
  };
  return map[status] ?? 0;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BookingTrackingPage() {
  const [bookingRef, setBookingRef] = useState('');
  const [phone, setPhone] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);
  const toast = useToast();

  const { data: booking, isLoading, isError } = useTrackBooking(
    searchTriggered ? bookingRef.trim() : '',
    searchTriggered ? phone.trim() : '',
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRef.trim()) {
      toast.error('Please enter your booking ID');
      return;
    }
    if (!phone.trim()) {
      toast.error('Please enter your mobile number');
      return;
    }
    setSearchTriggered(true);
  };

  const statusIndex = booking ? getStatusIndex(booking.status) : 0;

  return (
    <div className="animate-fadeIn">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Page Title */}
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text">Track Your Booking</h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">Enter your booking ID and mobile number to track your order</p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mt-6 rounded-2xl bg-surface border border-border p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text mb-1.5">
                Booking ID <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <input
                  type="text"
                  placeholder="Enter your booking ID"
                  value={bookingRef}
                  onChange={(e) => { setBookingRef(e.target.value); setSearchTriggered(false); }}
                  className="w-full rounded-xl bg-background border border-border pl-11 pr-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text mb-1.5">
                Mobile Number <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setSearchTriggered(false); }}
                  className="w-full rounded-xl bg-background border border-border pl-11 pr-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50 transition-opacity"
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
              <>
                Track Booking
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-text-muted">OR</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* WhatsApp tracking */}
          <a
            href="https://wa.me/919876543210?text=Hi%2C%20I%20want%20to%20track%20my%20booking."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium text-text hover:bg-surface transition-colors"
          >
            <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Track via WhatsApp
          </a>
        </form>

        {/* Booking Status Guide */}
        <div className="mt-8 rounded-2xl bg-surface border border-border p-5">
          <h3 className="text-sm font-semibold text-text mb-5">Booking Status Guide</h3>
          <div className="flex items-start justify-center gap-0 overflow-x-auto no-scrollbar">
            {STATUS_FLOW.map((step, idx) => (
              <div key={step.key} className="flex items-start">
                <div className="flex flex-col items-center text-center w-24 sm:w-32">
                  <div className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full border-2',
                    idx === 0 ? 'border-primary text-primary' : 'border-border text-text-muted'
                  )}>
                    {idx === 0 && (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {idx === 1 && (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    )}
                    {idx === 2 && (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                    )}
                    {idx === 3 && (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                      </svg>
                    )}
                  </div>
                  <p className={cn('text-[10px] sm:text-xs font-medium mt-2', idx === 0 ? 'text-primary' : 'text-text-muted')}>{step.label}</p>
                  <p className="text-[8px] sm:text-[10px] text-text-muted mt-0.5 px-1">{step.desc}</p>
                </div>
                {idx < STATUS_FLOW.length - 1 && (
                  <div className="flex items-center h-12 mx-0.5 sm:mx-1">
                    <div className="w-8 sm:w-12 border-t-2 border-dashed border-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Booking Results */}
        {searchTriggered && !isLoading && (
          <>
            {isError || !booking ? (
              <div className="mt-6 rounded-2xl bg-surface border border-border p-8 text-center">
                <svg className="h-12 w-12 text-text-muted mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <h3 className="font-heading text-lg font-semibold text-text">Booking not found</h3>
                <p className="text-sm text-text-muted mt-1">Please check your booking ID and phone number.</p>
              </div>
            ) : (
              /* Booking Detail Card */
              <div className="mt-6 rounded-2xl bg-surface border border-border p-5 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-text-muted">Booking ID</p>
                    <p className="text-lg font-bold font-mono text-primary">{booking.booking_ref}</p>
                  </div>
                  <span className={cn(
                    'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
                    booking.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    booking.status === 'delivered' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    booking.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-primary/10 text-primary border border-primary/20'
                  )}>
                    <svg className="h-2 w-2 fill-current" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" /></svg>
                    {booking.status === 'approved' ? 'Preparing' :
                     booking.status === 'pending' ? 'Confirmed' :
                     booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                {/* Product Info */}
                <div className="flex gap-4 rounded-xl bg-background p-4">
                  <img
                    src={`https://placehold.co/120x150/1A1A24/C8A96B?text=${encodeURIComponent(booking.product_name ?? 'Product')}`}
                    alt={booking.product_name ?? 'Product'}
                    className="w-24 h-28 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-semibold text-text">{booking.product_name ?? 'Product'}</h4>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        <span>{booking.start_date} – {booking.end_date}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Timeline */}
                <div>
                  <h4 className="text-sm font-semibold text-text mb-4">Order Status</h4>
                  <div className="space-y-0">
                    {STATUS_FLOW.map((step, idx) => {
                      const isComplete = idx <= statusIndex;
                      const isCurrent = idx === statusIndex;
                      return (
                        <div key={step.key} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-full',
                              isComplete ? 'bg-primary/15 text-primary' : 'bg-surface border border-border text-text-muted'
                            )}>
                              {isComplete ? (
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <span className="text-[10px]">{idx + 1}</span>
                              )}
                            </div>
                            {idx < STATUS_FLOW.length - 1 && (
                              <div className={cn('w-0.5 h-8', isComplete ? 'bg-primary/30' : 'bg-border')} />
                            )}
                          </div>
                          <div className="pb-6">
                            <p className={cn('text-xs font-medium', isComplete ? 'text-primary' : 'text-text-muted')}>{step.label}</p>
                            <p className="text-[10px] text-text-muted mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-border pt-4 space-y-2">
                  <h4 className="text-sm font-semibold text-text">Order Summary</h4>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Total Amount</span>
                    <span className="text-primary font-bold text-base">{formatCurrency(booking.total_amount)}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Need Help */}
        <div className="mt-8 rounded-2xl bg-surface border border-border p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-text">Need Help?</p>
              <p className="text-xs text-text-muted">Our support team is here to assist you.</p>
            </div>
          </div>
          <a
            href="/contact"
            className="flex items-center gap-1.5 rounded-lg border border-primary/20 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/5 transition-colors shrink-0"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
