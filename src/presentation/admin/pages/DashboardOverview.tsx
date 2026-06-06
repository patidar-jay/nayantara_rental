// ============================================================================
// DashboardOverview — Admin dashboard with live stats from Supabase
// ============================================================================

import { Link } from 'react-router-dom';
import type { BookingStatus } from '@core/entities';
import { useDashboardStats, useAdminBookings } from '@hooks';
import { formatCurrency, formatDate, cn } from '@utils';

// ---------------------------------------------------------------------------
// Status Badge
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<BookingStatus, { label: string; bg: string; text: string }> = {
  pending:   { label: 'Pending',   bg: 'bg-yellow-400/10', text: 'text-yellow-400' },
  approved:  { label: 'Approved',  bg: 'bg-blue-400/10',   text: 'text-blue-400' },
  delivered: { label: 'Delivered', bg: 'bg-green-400/10',  text: 'text-green-400' },
  returned:  { label: 'Returned',  bg: 'bg-gray-400/10',   text: 'text-gray-400' },
  rejected:  { label: 'Rejected',  bg: 'bg-red-400/10',    text: 'text-red-400' },
  cancelled: { label: 'Cancelled', bg: 'bg-gray-500/10',   text: 'text-gray-500' },
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', style.bg, style.text)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', style.text.replace('text-', 'bg-'))} />
      {style.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
  color: string;
  loading?: boolean;
}

function StatCard({ label, value, icon, trend, color, loading }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-surface-800 p-5 sm:p-6 transition-all hover:bg-surface-700/60">
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', color)}>
          {icon}
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-medium rounded-full px-2 py-0.5',
            trend.positive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          )}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div className="mt-4">
        {loading ? (
          <div className="h-8 w-20 skeleton rounded-lg" />
        ) : (
          <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick Action
// ---------------------------------------------------------------------------

function QuickAction({ label, icon, to }: { label: string; icon: React.ReactNode; to: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl bg-surface-800 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-surface-700 hover:text-white transition-all"
    >
      <span className="text-brand-400">{icon}</span>
      {label}
      <svg className="ml-auto h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardOverview() {
  const { data: stats, isLoading: loadingStats } = useDashboardStats();
  const { data: recentBookings, isLoading: loadingBookings } = useAdminBookings({ page: 1, pageSize: 5 });

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Welcome back, Admin</h2>
        <p className="mt-1 text-gray-500">Here's what's happening with your rental business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={stats?.totalProducts ?? 0}
          loading={loadingStats}
          color="bg-brand-600/15 text-brand-400"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>}
        />
        <StatCard
          label="Total Bookings"
          value={stats?.totalBookings ?? 0}
          loading={loadingStats}
          color="bg-purple-500/15 text-purple-400"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
        />
        <StatCard
          label="Pending Approvals"
          value={stats?.pendingBookings ?? 0}
          loading={loadingStats}
          color="bg-yellow-500/15 text-yellow-400"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Active Rentals"
          value={stats?.activeRentals ?? 0}
          loading={loadingStats}
          color="bg-green-500/15 text-green-400"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Categories"
          value={stats?.totalCategories ?? 0}
          loading={loadingStats}
          color="bg-orange-500/15 text-orange-400"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /></svg>}
        />
        <StatCard
          label="Monthly Revenue"
          value={loadingStats ? 0 : formatCurrency(stats?.monthlyRevenue ?? 0)}
          loading={loadingStats}
          color="bg-emerald-500/15 text-emerald-400"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Total Customers"
          value={stats?.totalCustomers ?? 0}
          loading={loadingStats}
          color="bg-cyan-500/15 text-cyan-400"
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
        />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Bookings Table */}
        <div className="xl:col-span-2 rounded-2xl bg-surface-800 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h3 className="text-base font-semibold text-white">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors">
              View all →
            </Link>
          </div>

          {loadingBookings ? (
            <div className="divide-y divide-white/5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  <div className="h-4 w-28 skeleton rounded" />
                  <div className="h-4 w-24 skeleton rounded" />
                  <div className="h-4 w-20 skeleton rounded ml-auto" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(recentBookings?.data ?? []).map((booking) => (
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
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-white">{formatCurrency(booking.total_amount)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={booking.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-white/5">
                {(recentBookings?.data ?? []).map((booking) => (
                  <div key={booking.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono font-medium text-brand-400">{booking.booking_ref}</span>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="text-sm text-white">{booking.customer.full_name}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{booking.items[0]?.product.name ?? '—'}</span>
                      <span className="font-semibold text-white">{formatCurrency(booking.total_amount)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {(recentBookings?.data ?? []).length === 0 && (
                <div className="p-8 text-center text-sm text-gray-500">No bookings yet</div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-2xl bg-surface-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
            </div>
            <div className="p-3 space-y-1">
              <QuickAction
                label="Add New Product"
                to="/admin/products"
                icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>}
              />
              <QuickAction
                label="Manage Bookings"
                to="/admin/bookings"
                icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
              />
              <QuickAction
                label="Check Availability"
                to="/admin/availability"
                icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
