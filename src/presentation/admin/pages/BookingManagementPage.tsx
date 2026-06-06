// ============================================================================
// BookingManagementPage — Admin booking table with live mutations
// ============================================================================

import { useState } from 'react';
import { useAdminBookings, useUpdateBookingStatus, BookingService } from '@hooks';
import { useToast } from '@presentation/shared/Toast';
import type { BookingDetail, BookingStatus } from '@core/entities';
import { formatCurrency, formatDate, cn } from '@utils';

// ---------------------------------------------------------------------------
// Status Config
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<BookingStatus, { label: string; bg: string; text: string }> = {
  pending:   { label: 'Pending',   bg: 'bg-yellow-400/10', text: 'text-yellow-400' },
  approved:  { label: 'Approved',  bg: 'bg-blue-400/10',   text: 'text-blue-400' },
  delivered: { label: 'Delivered', bg: 'bg-green-400/10',  text: 'text-green-400' },
  returned:  { label: 'Returned',  bg: 'bg-gray-400/10',   text: 'text-gray-400' },
  rejected:  { label: 'Rejected',  bg: 'bg-red-400/10',    text: 'text-red-400' },
  cancelled: { label: 'Cancelled', bg: 'bg-gray-500/10',   text: 'text-gray-500' },
};

const ALL_STATUSES: (BookingStatus | 'all')[] = ['all', 'pending', 'approved', 'delivered', 'returned', 'rejected', 'cancelled'];

function StatusBadge({ status }: { status: BookingStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', style.bg, style.text)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', style.text.replace('text-', 'bg-'))} />
      {style.label}
    </span>
  );
}

// Action buttons config per status
const ACTION_CONFIGS: Record<string, { label: string; nextStatus: BookingStatus; color: string }[]> = {
  pending:  [
    { label: 'Approve',  nextStatus: 'approved',  color: 'border-green-500/20 text-green-400 hover:bg-green-500/10' },
    { label: 'Reject',   nextStatus: 'rejected',  color: 'border-red-500/20 text-red-400 hover:bg-red-500/10' },
    { label: 'Cancel',   nextStatus: 'cancelled', color: 'border-gray-500/20 text-gray-400 hover:bg-gray-500/10' },
  ],
  approved: [
    { label: 'Deliver',  nextStatus: 'delivered',  color: 'border-blue-500/20 text-blue-400 hover:bg-blue-500/10' },
    { label: 'Cancel',   nextStatus: 'cancelled',  color: 'border-gray-500/20 text-gray-400 hover:bg-gray-500/10' },
  ],
  delivered: [
    { label: 'Return',   nextStatus: 'returned',   color: 'border-purple-500/20 text-purple-400 hover:bg-purple-500/10' },
  ],
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const ITEMS_PER_PAGE = 5;

export default function BookingManagementPage() {
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: result, isLoading } = useAdminBookings({
    status: statusFilter,
    search: search.trim(),
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
  });

  const updateStatus = useUpdateBookingStatus();

  const bookings = result?.data ?? [];
  const totalCount = result?.count ?? 0;
  const totalPages = result?.totalPages ?? 1;

  const handleStatusChange = async (bookingId: string, status: BookingStatus) => {
    try {
      await updateStatus.mutateAsync({ bookingId, status });
      toast.success(`Booking ${status}`);
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Booking Management</h1>
        <p className="mt-1 text-sm text-gray-500">{totalCount} total bookings</p>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-medium transition-all capitalize',
              statusFilter === s
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                : 'bg-surface-800 text-gray-400 hover:bg-surface-700 hover:text-white'
            )}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
        <input
          type="text"
          placeholder="Search by booking reference..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="w-full rounded-xl bg-surface-800 border border-white/5 pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-surface-800 border border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-white/5">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="h-4 w-28 skeleton rounded" />
                <div className="h-4 w-24 skeleton rounded" />
                <div className="h-4 w-16 skeleton rounded ml-auto" />
              </div>
            ))}
          </div>
        ) : bookings.length > 0 ? (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ref</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Dates</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-surface-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono font-medium text-brand-400">{booking.booking_ref}</span>
                        <p className="text-xs text-gray-600 mt-0.5">{formatDate(booking.created_at)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-white">{booking.customer.full_name}</p>
                        <p className="text-xs text-gray-500">{booking.customer.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-300">{booking.items[0]?.product.name ?? '—'}</p>
                        {booking.items[0] && (
                          <p className="text-xs text-gray-500">×{booking.items[0].quantity}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {booking.items[0] && (
                          <p className="text-xs text-gray-400">
                            {formatDate(booking.items[0].start_date)} → {formatDate(booking.items[0].end_date)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-white">{formatCurrency(booking.total_amount)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {(ACTION_CONFIGS[booking.status] ?? []).map((action) => (
                            <button
                              key={action.nextStatus}
                              type="button"
                              disabled={updateStatus.isPending}
                              onClick={() => handleStatusChange(booking.id, action.nextStatus)}
                              className={cn('rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all disabled:opacity-50', action.color)}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-white/5">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono font-medium text-brand-400">{booking.booking_ref}</span>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{booking.customer.full_name}</p>
                    <p className="text-xs text-gray-500">{booking.customer.phone}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{booking.items[0]?.product.name ?? '—'}</span>
                    <span className="font-semibold text-white">{formatCurrency(booking.total_amount)}</span>
                  </div>
                  {(ACTION_CONFIGS[booking.status] ?? []).length > 0 && (
                    <div className="flex gap-2 pt-1">
                      {(ACTION_CONFIGS[booking.status] ?? []).map((action) => (
                        <button
                          key={action.nextStatus}
                          type="button"
                          disabled={updateStatus.isPending}
                          onClick={() => handleStatusChange(booking.id, action.nextStatus)}
                          className={cn('flex-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all disabled:opacity-50', action.color)}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-20 text-center">
            <svg className="h-12 w-12 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
            <h3 className="text-lg font-semibold text-white">No bookings found</h3>
            <p className="mt-2 text-sm text-gray-500">Try adjusting your filters.</p>
          </div>
        )}

        {/* Pagination */}
        {totalCount > ITEMS_PER_PAGE && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 px-6 py-4">
            <p className="text-xs text-gray-500">
              Showing <span className="text-gray-300 font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>–<span className="text-gray-300 font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}</span> of <span className="text-gray-300 font-medium">{totalCount}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="rounded-lg bg-surface-700 px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-surface-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} type="button" onClick={() => setCurrentPage(page)} className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-all', currentPage === page ? 'bg-brand-600 text-white' : 'bg-surface-700 text-gray-400 hover:bg-surface-600')}>{page}</button>
              ))}
              <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="rounded-lg bg-surface-700 px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-surface-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
