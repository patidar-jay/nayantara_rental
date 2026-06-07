// ============================================================================
// RequireAuth — Route guard component for admin routes
//
// Checks for an active Supabase auth session. If not authenticated,
// redirects to the admin login page. Shows a loading spinner while
// the session is being verified.
// ============================================================================

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  // Still checking session — show minimal loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-text-muted">Verifying session…</p>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect to login, preserving intended destination
  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Authenticated — render protected content
  return <>{children}</>;
}
