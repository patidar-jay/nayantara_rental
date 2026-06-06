// ============================================================================
// Core Entities — Barrel Export
// All domain entities for the Nayantara Rental Platform
// ============================================================================

// --- Category ---
export type {
  Category,
  CategoryInsert,
  CategoryUpdate,
} from './category';

// --- Product & Product Media ---
export type {
  Product,
  ProductInsert,
  ProductUpdate,
  ProductMedia,
  ProductMediaInsert,
  ProductMediaUpdate,
  ProductWithCategory,
  ProductWithMedia,
  ProductDetail,
} from './product';

export type {
  MediaType,
  ProductStatus,
} from './product';

// --- Customer ---
export type {
  Customer,
  CustomerInsert,
  CustomerUpdate,
} from './customer';

// --- Booking & Booking Items ---
export type {
  Booking,
  BookingInsert,
  BookingUpdate,
  BookingItem,
  BookingItemInsert,
  BookingWithCustomer,
  BookingItemWithProduct,
  BookingDetail,
  AvailabilityCheck,
  AvailabilityResult,
} from './booking';

export type {
  BookingStatus,
  PaymentStatus,
  PaymentMethod,
} from './booking';

export { INVENTORY_RESERVING_STATUSES } from './booking';

// --- Admin ---
export type {
  Admin,
  AdminRole,
} from './admin';
