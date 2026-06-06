// ============================================================================
// Booking Entity
// Represents a rental booking with status workflow and payment readiness
// Maps to: bookings table
// ============================================================================

export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'delivered'
  | 'returned'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded';

export type PaymentMethod =
  | 'razorpay'
  | 'cashfree'
  | 'stripe'
  | 'cash'
  | 'bank_transfer'
  | null;

export interface Booking {
  id: string;
  booking_ref: string;
  customer_id: string;
  status: BookingStatus;
  total_amount: number;
  notes: string | null;

  // Payment-ready fields (Phase 1: not implemented, but schema-ready)
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  amount_paid: number;

  created_at: string;
  updated_at: string;
}

export interface BookingInsert {
  booking_ref: string;
  customer_id: string;
  status?: BookingStatus;
  total_amount: number;
  notes?: string | null;
  payment_status?: PaymentStatus;
  payment_method?: PaymentMethod;
  amount_paid?: number;
}

export interface BookingUpdate {
  status?: BookingStatus;
  total_amount?: number;
  notes?: string | null;
  payment_status?: PaymentStatus;
  payment_method?: PaymentMethod;
  amount_paid?: number;
  updated_at?: string;
}

// ============================================================================
// Booking Item Entity
// Represents a single line-item in a booking (product + dates + quantity)
// Maps to: booking_items table
// ============================================================================

export interface BookingItem {
  id: string;
  booking_id: string;
  product_id: string;
  start_date: string;       // ISO date string (YYYY-MM-DD)
  end_date: string;         // ISO date string (YYYY-MM-DD)
  quantity: number;
  price_per_day: number;
  total_days: number;
  subtotal: number;
  created_at: string;
}

export interface BookingItemInsert {
  booking_id: string;
  product_id: string;
  start_date: string;
  end_date: string;
  quantity: number;
  price_per_day: number;
  total_days: number;
  subtotal: number;
}

// ============================================================================
// Booking with Relations (join queries)
// ============================================================================

export interface BookingWithCustomer extends Booking {
  customer: {
    id: string;
    full_name: string;
    phone: string;
    email: string | null;
  };
}

export interface BookingItemWithProduct extends BookingItem {
  product: {
    id: string;
    name: string;
    slug: string;
    rental_price_per_day: number;
  };
}

export interface BookingDetail extends Booking {
  customer: {
    id: string;
    full_name: string;
    phone: string;
    email: string | null;
    address: string;
  };
  items: BookingItemWithProduct[];
}

// ============================================================================
// Inventory / Availability types (used by availability logic)
// ============================================================================

/** Statuses that reserve inventory — bookings in these states lock quantity */
export const INVENTORY_RESERVING_STATUSES: BookingStatus[] = [
  'pending',
  'approved',
  'delivered',
];

export interface AvailabilityCheck {
  product_id: string;
  start_date: string;
  end_date: string;
}

export interface AvailabilityResult {
  product_id: string;
  total_quantity: number;
  max_booked_quantity: number;
  available_quantity: number;
  is_available: boolean;
}
