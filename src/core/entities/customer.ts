// ============================================================================
// Customer Entity
// Represents a customer who makes a booking (no login required in Phase 1)
// Maps to: customers table
// ============================================================================

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerInsert {
  full_name: string;
  phone: string;
  email?: string | null;
  address: string;
}

export interface CustomerUpdate {
  full_name?: string;
  phone?: string;
  email?: string | null;
  address?: string;
  updated_at?: string;
}
