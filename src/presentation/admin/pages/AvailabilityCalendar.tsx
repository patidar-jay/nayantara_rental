// ============================================================================
// AvailabilityCalendar — Admin calendar with live availability data
// ============================================================================

import { useState, useEffect, useMemo } from 'react';
import { useProducts, useMonthlyAvailability } from '@hooks';
import type { CalendarDay } from '@hooks';
import { cn } from '@utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const STATUS_COLORS = {
  available: { bg: 'bg-green-500/15', border: 'border-green-500/30', text: 'text-green-400' },
  partial:   { bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  full:      { bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400' },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AvailabilityCalendar() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth()); // 0-indexed
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  // Fetch all active products for the selector
  const { data: productResult, isLoading: loadingProducts } = useProducts({ status: 'active', pageSize: 100 });
  const products = productResult?.data ?? [];

  // Auto-select first product
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const totalQty = selectedProduct?.total_quantity ?? 0;

  // Fetch monthly availability
  const { data: calendarDays, isLoading: loadingCalendar } = useMonthlyAvailability(
    selectedProductId || undefined,
    totalQty,
    year,
    month,
  );

  // Build calendar grid
  const calendarGrid = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // getDay returns 0=Sun..6=Sat, convert to Mon=0..Sun=6
    const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;

    const grid: (CalendarDay | null)[] = [];

    // Leading empty cells
    for (let i = 0; i < firstDayOfWeek; i++) {
      grid.push(null);
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayData = calendarDays?.find((cd) => cd.date === dateStr);
      grid.push(dayData ?? {
        date: dateStr,
        totalQuantity: totalQty,
        bookedQuantity: 0,
        availableQuantity: totalQty,
        status: 'available' as const,
      });
    }

    return grid;
  }, [year, month, calendarDays, totalQty]);

  const handlePrevMonth = () => {
    setSelectedDay(null);
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const handleNextMonth = () => {
    setSelectedDay(null);
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Availability Calendar</h1>
        <p className="mt-1 text-sm text-gray-500">View real-time equipment availability by date</p>
      </div>

      {/* Product Selector */}
      <div className="rounded-2xl bg-surface-800 p-5">
        <label htmlFor="product_select" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Select Product</label>
        {loadingProducts ? (
          <div className="h-10 w-full skeleton rounded-xl" />
        ) : products.length === 0 ? (
          <p className="text-sm text-gray-500">No active products found.</p>
        ) : (
          <select
            id="product_select"
            value={selectedProductId}
            onChange={(e) => { setSelectedProductId(e.target.value); setSelectedDay(null); }}
            className="w-full rounded-xl bg-surface-700 border border-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all cursor-pointer appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px',
            }}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.total_quantity} units)</option>
            ))}
          </select>
        )}
      </div>

      {/* Calendar */}
      {selectedProductId && (
        <div className="rounded-2xl bg-surface-800 p-5 sm:p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button type="button" onClick={handlePrevMonth} className="rounded-lg bg-surface-700 px-3 py-2 text-sm text-gray-400 hover:bg-surface-600 hover:text-white transition-all">
              ← Prev
            </button>
            <h3 className="text-lg font-semibold text-white">
              {MONTHS[month]} {year}
            </h3>
            <button type="button" onClick={handleNextMonth} className="rounded-lg bg-surface-700 px-3 py-2 text-sm text-gray-400 hover:bg-surface-600 hover:text-white transition-all">
              Next →
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">{day}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          {loadingCalendar ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-12 sm:h-16 skeleton rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {calendarGrid.map((day, i) => {
                if (!day) {
                  return <div key={`empty-${i}`} className="h-12 sm:h-16 rounded-lg bg-surface-900/50" />;
                }

                const dayNum = parseInt(day.date.split('-')[2], 10);
                const colors = STATUS_COLORS[day.status];
                const isSelected = selectedDay?.date === day.date;

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={cn(
                      'h-12 sm:h-16 rounded-lg border text-sm font-medium transition-all flex items-center justify-center',
                      colors.bg, colors.border, colors.text,
                      isSelected ? 'ring-2 ring-brand-500' : 'hover:ring-2 hover:ring-brand-500/40',
                    )}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/5">
            {[
              { status: 'available' as const, label: 'Available' },
              { status: 'partial' as const, label: 'Partially Booked' },
              { status: 'full' as const, label: 'Fully Booked' },
            ].map(({ status, label }) => (
              <div key={status} className="flex items-center gap-2">
                <div className={cn('h-3 w-3 rounded-sm border', STATUS_COLORS[status].bg, STATUS_COLORS[status].border)} />
                <span className="text-xs text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day Detail Card */}
      {selectedDay && (
        <div className="rounded-2xl bg-surface-800 p-6">
          <h3 className="text-base font-semibold text-white mb-4">
            {selectedProduct?.name} — {selectedDay.date}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-surface-700 p-4 text-center">
              <p className="text-2xl font-bold text-white">{selectedDay.totalQuantity}</p>
              <p className="text-xs text-gray-500 mt-1">Total Units</p>
            </div>
            <div className="rounded-xl bg-surface-700 p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{selectedDay.bookedQuantity}</p>
              <p className="text-xs text-gray-500 mt-1">Booked</p>
            </div>
            <div className="rounded-xl bg-surface-700 p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{selectedDay.availableQuantity}</p>
              <p className="text-xs text-gray-500 mt-1">Available</p>
            </div>
          </div>

          {/* Capacity Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Utilization</span>
              <span>{selectedDay.totalQuantity > 0 ? Math.round((selectedDay.bookedQuantity / selectedDay.totalQuantity) * 100) : 0}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface-700 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  selectedDay.status === 'full' ? 'bg-red-500' : selectedDay.status === 'partial' ? 'bg-yellow-500' : 'bg-green-500'
                )}
                style={{ width: `${selectedDay.totalQuantity > 0 ? (selectedDay.bookedQuantity / selectedDay.totalQuantity) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
