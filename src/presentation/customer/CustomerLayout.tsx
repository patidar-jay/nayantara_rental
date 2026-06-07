// ============================================================================
// CustomerLayout — Responsive layout wrapper with Header + Footer
// Provides consistent navigation chrome for all customer-facing pages.
// ============================================================================

import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@utils';

// ---------------------------------------------------------------------------
// Navigation Links
// ---------------------------------------------------------------------------

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'Track Booking', path: '/track' },
] as const;

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-background font-bold text-sm transition-transform group-hover:scale-110">
            N
          </div>
          <span className="text-lg font-bold text-text tracking-tight">
            Nayantara<span className="text-primary"> Rentals</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === link.path
                  ? 'text-text bg-border'
                  : 'text-text-muted hover:text-text hover:bg-border/50'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/products"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-background transition-all hover:opacity-90 hover:shadow-lg hover:shadow-primary/25"
          >
            Browse Rentals
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          type="button"
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={cn(
            'block h-0.5 w-6 bg-text transition-all duration-300',
            mobileOpen && 'translate-y-2 rotate-45'
          )} />
          <span className={cn(
            'block h-0.5 w-6 bg-text transition-all duration-300',
            mobileOpen && 'opacity-0'
          )} />
          <span className={cn(
            'block h-0.5 w-6 bg-text transition-all duration-300',
            mobileOpen && '-translate-y-2 -rotate-45'
          )} />
        </button>
      </div>

      {/* Mobile Nav Panel */}
      <div className={cn(
        'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
        mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
      )}>
        <nav className="flex flex-col gap-1 px-4 pb-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                pathname === link.path
                  ? 'text-text bg-border'
                  : 'text-text-muted hover:text-text hover:bg-border/50'
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/products"
            onClick={() => setMobileOpen(false)}
            className="mt-2 rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-background transition-all hover:opacity-90"
          >
            Browse Rentals
          </Link>
        </nav>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

const FOOTER_LINKS = {
  Product: [
    { label: 'Browse All', path: '/products' },
    { label: 'Categories', path: '/products' },
    { label: 'Featured', path: '/' },
  ],
  Support: [
    { label: 'Track Booking', path: '/track' },
    { label: 'Contact Us', path: '/#contact' },
    { label: 'FAQs', path: '/' },
  ],
  Company: [
    { label: 'About Us', path: '/' },
    { label: 'Terms', path: '/' },
    { label: 'Privacy', path: '/' },
  ],
} as const;

function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-background font-bold text-sm">
                N
              </div>
              <span className="text-lg font-bold text-text tracking-tight">
                Nayantara
              </span>
            </Link>
            <p className="mt-4 text-sm text-text-muted leading-relaxed max-w-xs">
              Premium dress rentals for every occasion. Lehengas, sarees, gowns, sherwanis & more.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-text mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-text-muted hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Nayantara Rentals. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Social placeholder icons */}
            {['Instagram', 'Twitter', 'Facebook'].map((name) => (
              <a
                key={name}
                href="#"
                aria-label={name}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-text-muted hover:opacity-90/20 hover:text-primary transition-colors"
              >
                <span className="text-xs font-bold">{name[0]}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Layout Export
// ---------------------------------------------------------------------------

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-background text-text">
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
