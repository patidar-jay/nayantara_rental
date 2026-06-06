// ============================================================================
// Admin Entity
// Represents an admin user for dashboard authentication
// Maps to: admins table
// ============================================================================

export type AdminRole = 'super_admin' | 'admin';

export interface Admin {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}
