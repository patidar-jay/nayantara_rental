// ============================================================================
// BookingFormPage — Matches reference image 7
// Simplified booking form + Order summary sidebar
// ============================================================================

import { useMemo, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { useProduct, useCreateBooking, BookingService } from '@hooks';
import { useToast } from '@presentation/shared/Toast';
import { formatCurrency, calculateTotalDays, cn } from '@utils';
import type { BookingDetail } from '@core/entities';

// ---------------------------------------------------------------------------
// Zod Schema
// ---------------------------------------------------------------------------

const customerSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number required').regex(
    /^[+]?[\d\s-]{10,15}$/,
    'Please enter a valid phone number',
  ),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().min(5, 'Address is required'),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

// ---------------------------------------------------------------------------
// Input Component
// ---------------------------------------------------------------------------

function FormInput({
  label,
  required,
  error,
  ...props
}: {
  label: string;
  required?: boolean;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs font-medium text-text mb-1.5">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <input
        {...props}
        className={cn(
          'w-full rounded-xl bg-background border px-4 py-3 text-sm text-text placeholder:text-text-muted',
          'focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all',
          error ? 'border-red-500/50' : 'border-border'
        )}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BookingFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const startDate = searchParams.get('start_date') ?? '';
  const endDate = searchParams.get('end_date') ?? '';
  const quantity = parseInt(searchParams.get('quantity') ?? '1', 10);

  const { data: product, isLoading: loadingProduct } = useProduct(slug);
  const createBooking = useCreateBooking();

  const [completedBooking, setCompletedBooking] = useState<BookingDetail | null>(null);

  // Local date state (allow user to pick dates here if not from URL)
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);
  const [localQty, setLocalQty] = useState(quantity);

  const effectiveStart = localStart || startDate;
  const effectiveEnd = localEnd || endDate;
  const effectiveQty = localQty || quantity;

  const { register, handleSubmit, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  // Calculate totals
  const summary = useMemo(() => {
    if (!product || !effectiveStart || !effectiveEnd) return null;
    return BookingService.calculateSummary(
      product.rental_price_per_day,
      effectiveStart,
      effectiveEnd,
      effectiveQty,
    );
  }, [product, effectiveStart, effectiveEnd, effectiveQty]);

  const onSubmit = async (formData: CustomerFormData) => {
    if (!product || !effectiveStart || !effectiveEnd) {
      toast.error('Please select rental dates.');
      return;
    }

    try {
      const booking = await createBooking.mutateAsync({
        product,
        startDate: effectiveStart,
        endDate: effectiveEnd,
        quantity: effectiveQty,
        customer: {
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email || null,
          address: formData.address,
        },
        notes: formData.notes || null,
      });
      setCompletedBooking(booking);
      toast.success('Booking created successfully!');
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to create booking');
    }
  };

  // =========================================================================
  // Success State — Booking Confirmed (matches reference image 10)
  // =========================================================================
  if (completedBooking) {
    return (
      <div className="animate-fadeIn">
        <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 text-center">
          {/* Success Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-green-500 text-green-500 mx-auto mb-6">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h1 className="font-heading text-3xl font-bold text-text">Booking Confirmed!</h1>
          <p className="mt-2 text-sm text-text-muted">Your outfit is all set for your special occasion.</p>

          {/* Booking Ref */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-xl bg-surface border border-border px-5 py-3">
            <span className="text-sm text-text-muted">Booking ID</span>
            <span className="text-lg font-bold font-mono text-primary">{completedBooking.booking_ref}</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(completedBooking.booking_ref);
                toast.success('Copied to clipboard!');
              }}
              className="flex items-center gap-1 rounded-lg bg-background px-3 py-1.5 text-xs text-text-muted hover:text-text transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
              Copy
            </button>
          </div>

          {/* What's Next Timeline */}
          <div className="mt-8 rounded-2xl bg-surface border border-border p-6">
            <h3 className="text-sm font-semibold text-text mb-5">What's Next?</h3>
            <div className="flex items-start justify-center gap-0">
              {[
                { label: 'Preparing', desc: 'We are preparing your outfit', active: true },
                { label: 'Out for Delivery', desc: 'You will receive an update soon', active: false },
                { label: 'Delivered', desc: 'Enjoy your special outfit!', active: false },
                { label: 'Return', desc: 'Hassle-free return after use', active: false },
              ].map((step, idx) => (
                <div key={step.label} className="flex items-start">
                  <div className="flex flex-col items-center text-center w-20 sm:w-28">
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2',
                      step.active ? 'border-green-500 text-green-500' : 'border-border text-text-muted'
                    )}>
                      {step.active && (
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className={cn('text-[10px] font-medium mt-2', step.active ? 'text-green-500' : 'text-text-muted')}>{step.label}</p>
                    <p className="text-[8px] text-text-muted mt-0.5 hidden sm:block">{step.desc}</p>
                  </div>
                  {idx < 3 && (
                    <div className="flex items-center h-10 mx-0.5">
                      <div className="w-6 sm:w-10 border-t-2 border-dashed border-border" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Product Summary Card */}
          {product && (
            <div className="mt-6 rounded-2xl bg-surface border border-border p-5 text-left">
              <div className="flex gap-4">
                <img
                  src={(product as any).product_media?.[0]?.media_url ?? `https://placehold.co/120x150/1A1A24/C8A96B?text=${encodeURIComponent(product.name)}`}
                  alt={product.name}
                  className="w-24 h-32 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-semibold text-text">{product.name}</h4>
                  {product.category && <p className="text-xs text-text-muted">{product.category.name}</p>}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Rental Duration</span>
                      <span className="text-text">{summary?.totalDays ?? calculateTotalDays(effectiveStart, effectiveEnd)} Days</span>
                    </div>
                    {summary && (
                      <div className="flex justify-between text-xs border-t border-border pt-1.5 mt-1.5">
                        <span className="text-primary font-semibold">Total Amount</span>
                        <span className="text-primary font-bold text-base">{formatCurrency(summary.totalAmount)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/track"
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
            >
              Track Booking
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              to="/products"
              className="flex items-center justify-center gap-2 rounded-lg border border-primary/40 px-6 py-3 text-sm font-medium text-text hover:bg-primary/5 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Thank You */}
          <div className="mt-8 rounded-2xl bg-primary/5 border border-primary/20 p-5 flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-primary">Thank you for choosing Nayantara Rentals!</p>
              <p className="text-xs text-text-muted mt-0.5">We look forward to being a part of your special moments.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading
  if (loadingProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="h-8 w-48 skeleton rounded" />
            <div className="h-72 skeleton rounded-2xl" />
          </div>
          <div className="lg:col-span-2">
            <div className="h-96 skeleton rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const imageUrl = (product as any).product_media?.[0]?.media_url
    ?? `https://placehold.co/200x260/1A1A24/C8A96B?text=${encodeURIComponent(product.name)}`;

  return (
    <div className="animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text">Book Your Outfit</h1>
          <p className="text-xs text-text-muted mt-1">Fill in the details below to book your favorite outfit</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* ============================================================ */}
          {/* Left — Form                                                   */}
          {/* ============================================================ */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Rental Duration Section */}
              <div className="rounded-2xl bg-surface border border-border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <h3 className="text-sm font-semibold text-text">Rental Duration</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={localStart}
                      onChange={(e) => setLocalStart(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-xl bg-background border border-border px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={localEnd}
                      onChange={(e) => setLocalEnd(e.target.value)}
                      min={localStart || new Date().toISOString().split('T')[0]}
                      className="w-full rounded-xl bg-background border border-border px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                {effectiveStart && effectiveEnd && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/10 px-4 py-2.5">
                    <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    <span className="text-xs text-primary font-medium">
                      Total Duration: {calculateTotalDays(effectiveStart, effectiveEnd)} Days
                    </span>
                  </div>
                )}

                {/* Quantity */}
                <div className="mt-3">
                  <label className="block text-xs text-text-muted mb-1.5">Quantity</label>
                  <input
                    type="number"
                    value={localQty}
                    onChange={(e) => setLocalQty(Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                    max={product.total_quantity}
                    className="w-24 rounded-xl bg-background border border-border px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              {/* Personal Details Section */}
              <div className="rounded-2xl bg-surface border border-border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-text">Personal Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Full Name"
                    required
                    placeholder="Ananya Sharma"
                    error={errors.full_name?.message}
                    {...register('full_name')}
                  />
                  <FormInput
                    label="Phone Number"
                    required
                    type="tel"
                    placeholder="98765 43210"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                  <FormInput
                    label="Email Address"
                    type="email"
                    placeholder="ananya@email.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="rounded-2xl bg-surface border border-border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-text">Delivery Address</h3>
                </div>
                <textarea
                  placeholder="Full address with city, state, and PIN code"
                  rows={3}
                  {...register('address')}
                  className={cn(
                    'w-full rounded-xl bg-background border px-4 py-3 text-sm text-text placeholder:text-text-muted',
                    'focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none',
                    errors.address ? 'border-red-500/50' : 'border-border'
                  )}
                />
                {errors.address && <p className="mt-1 text-xs text-red-400">{errors.address.message}</p>}
              </div>

              {/* Notes */}
              <div className="rounded-2xl bg-surface border border-border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-text">Special Instructions <span className="text-text-muted font-normal">(Optional)</span></h3>
                </div>
                <textarea
                  placeholder="Any special requests or instructions..."
                  rows={2}
                  {...register('notes')}
                  className="w-full rounded-xl bg-background border border-border px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
                />
              </div>

              {/* Submit (visible on mobile below form) */}
              <button
                type="submit"
                disabled={createBooking.isPending || !effectiveStart || !effectiveEnd}
                className="w-full lg:hidden flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {createBooking.isPending ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm Booking
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>

              <div className="text-center lg:hidden">
                <p className="text-[10px] text-text-muted flex items-center justify-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Your information is safe and secure with us.
                </p>
              </div>
            </form>
          </div>

          {/* ============================================================ */}
          {/* Right — Order Summary                                         */}
          {/* ============================================================ */}
          <div className="lg:col-span-2 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl bg-surface border border-border p-5 space-y-5">
              <h3 className="text-sm font-semibold text-text">Order Summary</h3>

              {/* Product Image + Info */}
              <div className="flex flex-col items-center">
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full max-w-[200px] aspect-[3/4] rounded-xl object-cover"
                />
                <h4 className="font-heading font-semibold text-text mt-3">{product.name}</h4>
                {product.category && (
                  <p className="text-xs text-text-muted">{product.category.name}</p>
                )}
                <p className="text-primary font-semibold mt-1">{formatCurrency(product.rental_price_per_day)}<span className="text-xs text-text-muted"> /day</span></p>
              </div>

              {/* Price Breakdown */}
              {summary && (
                <div className="space-y-2 pt-3 border-t border-border">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Rental Duration</span>
                    <span className="text-text">{summary.totalDays} Days</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">{summary.totalDays} Days × {formatCurrency(product.rental_price_per_day)}</span>
                    <span className="text-text">{formatCurrency(summary.pricePerDay * summary.totalDays)}</span>
                  </div>
                  {effectiveQty > 1 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Quantity</span>
                      <span className="text-text">×{effectiveQty}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border">
                    <span className="text-primary">Total Amount</span>
                    <span className="text-primary text-lg">{formatCurrency(summary.totalAmount)}</span>
                  </div>
                </div>
              )}

              {/* Trust Points */}
              <div className="space-y-2 pt-3 border-t border-border">
                {[
                  { icon: '🛡️', text: '100% Authentic Outfits' },
                  { icon: '🔄', text: 'Hassle-Free Returns' },
                  { icon: '🔒', text: 'Secure Payments' },
                  { icon: '🚚', text: 'Free Delivery Pan India' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2">
                    <span className="text-xs">{item.icon}</span>
                    <span className="text-xs text-text-muted">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Desktop Submit */}
              <button
                type="submit"
                form="booking-form"
                onClick={handleSubmit(onSubmit)}
                disabled={createBooking.isPending || !effectiveStart || !effectiveEnd}
                className="hidden lg:flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {createBooking.isPending ? 'Processing...' : 'Confirm Booking →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
