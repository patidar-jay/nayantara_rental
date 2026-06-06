// ============================================================================
// BookingFormPage — Customer booking form with live submission
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
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
  phone: z.string().min(10, 'Valid phone number required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().min(5, 'Address is required'),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

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

  const { register, handleSubmit, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  // Calculate totals
  const summary = useMemo(() => {
    if (!product || !startDate || !endDate) return null;
    return BookingService.calculateSummary(
      product.rental_price_per_day,
      startDate,
      endDate,
      quantity,
    );
  }, [product, startDate, endDate, quantity]);

  const onSubmit = async (formData: CustomerFormData) => {
    if (!product || !startDate || !endDate) return;

    try {
      const booking = await createBooking.mutateAsync({
        product,
        startDate,
        endDate,
        quantity,
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

  // Redirect if missing params
  if (!startDate || !endDate) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Missing Booking Details</h1>
          <p className="mt-3 text-gray-400">Please select dates from the product page.</p>
          <Link to="/products" className="mt-6 inline-block rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-500 transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // Success State
  if (completedBooking) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center text-center px-4 py-12">
        <div className="max-w-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 text-green-400 mx-auto mb-6">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Booking Confirmed!</h1>
          <p className="mt-3 text-gray-400">Your booking has been submitted for review.</p>

          <div className="mt-6 rounded-2xl bg-surface-800 p-6">
            <p className="text-sm text-gray-400 mb-1">Booking Reference</p>
            <p className="text-2xl font-bold font-mono text-brand-400">{completedBooking.booking_ref}</p>
          </div>

          <p className="mt-4 text-sm text-gray-500">Save this reference to track your booking status.</p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={`/track`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-500 transition-colors"
            >
              Track Booking
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-gray-300 hover:bg-white/5 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading
  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-surface-950 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-4">
              <div className="h-10 w-48 skeleton rounded-lg" />
              <div className="h-64 skeleton rounded-2xl" />
            </div>
            <div className="lg:col-span-2 h-80 skeleton rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Product Not Found</h1>
          <Link to="/products" className="mt-6 inline-block rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-500 transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/products/${slug}`} className="hover:text-white transition-colors">{product.name}</Link>
          <span>/</span>
          <span className="text-gray-400">Book</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Customer Form */}
          <div className="lg:col-span-3">
            <h1 className="text-2xl font-bold text-white mb-6">Complete Your Booking</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="rounded-2xl bg-surface-800 p-6 space-y-5">
                <h2 className="text-base font-semibold text-white">Contact Details</h2>

                {/* Full Name */}
                <div>
                  <label htmlFor="full_name" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input
                    {...register('full_name')}
                    id="full_name"
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full rounded-xl bg-surface-700 border border-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                  />
                  {errors.full_name && <p className="mt-1 text-xs text-red-400">{errors.full_name.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Phone Number</label>
                  <input
                    {...register('phone')}
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl bg-surface-700 border border-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Email (Optional)</label>
                  <input
                    {...register('email')}
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="w-full rounded-xl bg-surface-700 border border-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Delivery Address</label>
                  <textarea
                    {...register('address')}
                    id="address"
                    rows={3}
                    placeholder="Full address for equipment delivery"
                    className="w-full rounded-xl bg-surface-700 border border-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all resize-none"
                  />
                  {errors.address && <p className="mt-1 text-xs text-red-400">{errors.address.message}</p>}
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Notes (Optional)</label>
                  <textarea
                    {...register('notes')}
                    id="notes"
                    rows={2}
                    placeholder="Any special requirements..."
                    className="w-full rounded-xl bg-surface-700 border border-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={createBooking.isPending}
                className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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
                  'Confirm Booking'
                )}
              </button>

              {createBooking.isError && (
                <p className="text-sm text-red-400 text-center">
                  {(createBooking.error as Error)?.message ?? 'Failed to create booking'}
                </p>
              )}
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl bg-surface-800 p-6">
              <h3 className="text-base font-semibold text-white mb-4">Order Summary</h3>

              <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-brand-600/30 to-brand-800/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-brand-400">{product.name.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(product.rental_price_per_day)}/day</p>
                </div>
              </div>

              <dl className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-400">Dates</dt>
                  <dd className="text-white">{startDate} → {endDate}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-400">Duration</dt>
                  <dd className="text-white">{summary?.totalDays ?? 0} days</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-400">Quantity</dt>
                  <dd className="text-white">{quantity}</dd>
                </div>
                <div className="border-t border-white/5 pt-3 flex justify-between text-sm">
                  <dt className="text-gray-400 font-semibold">Total</dt>
                  <dd className="text-xl font-bold text-brand-400">
                    {summary ? formatCurrency(summary.totalAmount) : '—'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
