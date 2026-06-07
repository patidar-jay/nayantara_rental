// ============================================================================
// AdminLoginPage — Minimal, premium login page for admin access
// ============================================================================

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@infrastructure/auth/AuthContext';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminLoginPage() {
  const { signIn, isLoading: authLoading, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect to admin dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';
  if (session && !authLoading) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    setSubmitting(true);
    const result = await signIn(email.trim(), password.trim());
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-background font-bold text-sm">
              N
            </div>
            <div className="text-left">
              <span className="text-lg font-bold text-text tracking-tight">Nayantara</span>
              <span className="block text-[10px] text-text-muted uppercase tracking-widest">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-surface border border-border p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-text">Welcome back</h1>
            <p className="mt-1 text-sm text-text-muted">Sign in to access the admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="login_email" className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                id="login_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nayantara.com"
                autoComplete="email"
                className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login_password" className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                id="login_password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || authLoading}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Back to website */}
        <p className="mt-6 text-center text-xs text-text-muted">
          <Link to="/" className="hover:text-primary transition-colors">
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
