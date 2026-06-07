// ============================================================================
// BookingWidget — Product Booking Form
// Glass-card widget with date/quantity inputs, rental summary, and availability
// ============================================================================

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { useNavigate } from 'react-router-dom';
import type { Product, AvailabilityResult } from '@core/entities';
import {
  formatCurrency,
  calculateTotalDays,
  getTodayISO,
  getTomorrowISO,
  cn,
} from '@utils';

// ---------------------------------------------------------------------------
// Schema & Types
// ---------------------------------------------------------------------------

const bookingSchema = z.object({
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  quantity: z.number().int().min(1, 'At least 1 unit required'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BookingWidgetProps {
  product: Product;
  availability?: AvailabilityResult | null;
  onCheckAvailability?: (startDate: string, endDate: string) => void;
  isCheckingAvailability?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function BookingWidget({
  product,
  availability,
  onCheckAvailability,
  isCheckingAvailability = false,
}: BookingWidgetProps) {
  const navigate = useNavigate();

  // --- Form Setup ---
  const {
    register,
    watch,
    formState: { errors },
    handleSubmit,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      start_date: getTodayISO(),
      end_date: getTomorrowISO(),
      quantity: 1,
    },
  });

  // Watch live values for real-time calculations
  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const quantity = watch('quantity');

  // --- Rental Calculations ---
  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const days = calculateTotalDays(startDate, endDate);
    return days > 0 ? days : 0;
  }, [startDate, endDate]);

  const totalRent = useMemo(() => {
    return product.rental_price_per_day * (quantity || 1) * totalDays;
  }, [product.rental_price_per_day, quantity, totalDays]);

  // --- Availability State ---
  const [hasChecked, setHasChecked] = useState(false);

  // Reset availability check when dates change
  useEffect(() => {
    setHasChecked(false);
  }, [startDate, endDate]);

  // Mark as checked when availability result arrives
  useEffect(() => {
    if (availability !== undefined && availability !== null) {
      setHasChecked(true);
    }
  }, [availability]);

  // Determine if booking is blocked
  const isBookingDisabled = useMemo(() => {
    if (!hasChecked || !availability) return false;
    if (!availability.is_available) return true;
    if ((quantity || 1) > availability.available_quantity) return true;
    return false;
  }, [hasChecked, availability, quantity]);

  // --- Handlers ---
  const handleCheckAvailability = () => {
    if (onCheckAvailability && startDate && endDate) {
      onCheckAvailability(startDate, endDate);
    }
  };

  const onSubmit = (data: BookingFormData) => {
    const params = new URLSearchParams({
      start_date: data.start_date,
      end_date: data.end_date,
      quantity: String(data.quantity),
    });
    navigate(`/products/${product.slug}/book?${params.toString()}`);
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="glass rounded-xl bg-surface p-6">
      {/* --- Header --- */}
      <div className="mb-5">
        <p className="text-sm text-text-muted">Rental price</p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-text">
            {formatCurrency(product.rental_price_per_day)}
          </span>
          <span className="text-sm text-text-muted">/ day</span>
        </div>
      </div>

      {/* --- Form --- */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Date inputs row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Start Date */}
          <div>
            <label
              htmlFor="start_date"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted"
            >
              Start Date
            </label>
            <input
              id="start_date"
              type="date"
              min={getTodayISO()}
              {...register('start_date')}
              className={cn(
                'w-full rounded-lg bg-surface px-3 py-2.5 text-sm text-text',
                'outline-none transition-all duration-200',
                'focus:ring-2 focus:ring-primary focus:ring-offset-0',
                'placeholder:text-text-muted',
                errors.start_date && 'ring-2 ring-error-500'
              )}
            />
            {errors.start_date && (
              <p className="mt-1 text-xs text-error-500">
                {errors.start_date.message}
              </p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label
              htmlFor="end_date"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted"
            >
              End Date
            </label>
            <input
              id="end_date"
              type="date"
              min={startDate || getTodayISO()}
              {...register('end_date')}
              className={cn(
                'w-full rounded-lg bg-surface px-3 py-2.5 text-sm text-text',
                'outline-none transition-all duration-200',
                'focus:ring-2 focus:ring-primary focus:ring-offset-0',
                'placeholder:text-text-muted',
                errors.end_date && 'ring-2 ring-error-500'
              )}
            />
            {errors.end_date && (
              <p className="mt-1 text-xs text-error-500">
                {errors.end_date.message}
              </p>
            )}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label
            htmlFor="quantity"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted"
          >
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            min={1}
            max={availability?.available_quantity ?? product.total_quantity}
            {...register('quantity', { valueAsNumber: true })}
            className={cn(
              'w-full rounded-lg bg-surface px-3 py-2.5 text-sm text-text',
              'outline-none transition-all duration-200',
              'focus:ring-2 focus:ring-primary focus:ring-offset-0',
              errors.quantity && 'ring-2 ring-error-500'
            )}
          />
          {errors.quantity && (
            <p className="mt-1 text-xs text-error-500">
              {errors.quantity.message}
            </p>
          )}
        </div>

        {/* --- Availability Badge --- */}
        {hasChecked && availability && (
          <div className="flex items-center gap-2">
            {availability.is_available ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-500/15 px-3 py-1 text-xs font-medium text-success-500">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-success-500 pulse-soft" />
                {availability.available_quantity} unit
                {availability.available_quantity !== 1 ? 's' : ''} available
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-error-500/15 px-3 py-1 text-xs font-medium text-error-500">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-error-500" />
                Not available
              </span>
            )}
          </div>
        )}

        {/* --- Rental Summary --- */}
        {totalDays > 0 && (
          <div className="space-y-2.5 border-t border-dotted border-border pt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Rental Summary
            </h4>

            {/* Price / Day */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Price / Day</span>
              <span className="text-text">
                {formatCurrency(product.rental_price_per_day)}
              </span>
            </div>

            {/* Total Days */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Total Days</span>
              <span className="text-text">{totalDays}</span>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Quantity</span>
              <span className="text-text">&times; {quantity || 1}</span>
            </div>

            {/* Divider */}
            <div className="border-t border-dotted border-border" />

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-muted">
                Total Rent
              </span>
              <span className="text-lg font-bold text-text">
                {formatCurrency(totalRent)}
              </span>
            </div>
          </div>
        )}

        {/* --- Action Buttons --- */}
        <div className="space-y-3 pt-2">
          {/* Check Availability */}
          {onCheckAvailability && (
            <button
              type="button"
              onClick={handleCheckAvailability}
              disabled={isCheckingAvailability || !startDate || !endDate}
              className={cn(
                'w-full rounded-lg border border-border px-4 py-2.5',
                'text-sm font-medium text-text-muted',
                'transition-all duration-200',
                'hover:border-primary/40 hover:text-text',
                'focus:outline-none focus:ring-2 focus:ring-primary/40',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              {isCheckingAvailability ? (
                <span className="inline-flex items-center gap-2">
                  {/* Spinner */}
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Checking…
                </span>
              ) : (
                'Check Availability'
              )}
            </button>
          )}

          {/* Book Now */}
          <button
            type="submit"
            disabled={isBookingDisabled}
            className={cn(
              'w-full rounded-lg bg-primary px-4 py-3',
              'text-sm font-semibold text-text',
              'transition-all duration-200',
              'hover:opacity-90 hover:shadow-lg hover:shadow-primary/25',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-90 disabled:hover:shadow-none'
            )}
          >
            Book Now
          </button>

          {/* Warning when quantity exceeds available */}
          {hasChecked &&
            availability?.is_available &&
            (quantity || 1) > availability.available_quantity && (
              <p className="text-center text-xs text-warning-500">
                Only {availability.available_quantity} unit
                {availability.available_quantity !== 1 ? 's' : ''} available for
                these dates.
              </p>
            )}
        </div>
      </form>
    </div>
  );
}

export default BookingWidget;
