// ============================================================================
// Hooks — Barrel Export
// Re-exports all TanStack Query hooks for convenient imports.
//
// Usage:
//   import { useProducts, useCreateBooking, useAvailability } from '@hooks';
// ============================================================================

// Products
export {
  useProducts,
  useProduct,
  useFeaturedProducts,
  useProductsByCategory,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  productKeys,
} from './useProducts';
export type { ProductFilters, PaginatedResult } from './useProducts';

// Bookings
export {
  useAdminBookings,
  useBookingByRef,
  useTrackBooking,
  useCreateBooking,
  useUpdateBookingStatus,
  useDashboardStats,
  BookingService,
  bookingKeys,
} from './useBookings';
export type { BookingFilters, PaginatedBookings, DashboardStats } from './useBookings';

// Inventory / Availability
export {
  useAvailability,
  useAvailableQty,
  useMonthlyAvailability,
  inventoryKeys,
} from './useInventory';
export type { AvailabilityParams, CalendarDay } from './useInventory';

// Categories
export {
  useCategories,
  useAllCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  categoryKeys,
} from './useCategories';

// Media Upload
export {
  useProductMedia,
  useUploadMedia,
  useDeleteMedia,
  useMultiUpload,
  mediaKeys,
} from './useMediaUpload';
