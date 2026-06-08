// ============================================================================
// CustomerLayout — Premium layout with Header + BottomNav + Footer
// Matches reference images: centered logo, hamburger, bottom tab bar
// ============================================================================

import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@utils';

// ---------------------------------------------------------------------------
// Bottom Nav Tabs
// ---------------------------------------------------------------------------

const BOTTOM_TABS = [
  {
    label: 'Home',
    path: '/',
    icon: (active: boolean) => (
      <svg className="h-6 w-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    label: 'Browse',
    path: '/products',
    icon: (active: boolean) => (
      <svg className="h-6 w-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: 'Track Booking',
    path: '/track',
    icon: (active: boolean) => (
      <svg className="h-6 w-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
  },
  {
    label: 'Contact',
    path: '/contact',
    icon: (active: boolean) => (
      <svg className="h-6 w-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
  },
] as const;

// ---------------------------------------------------------------------------
// Drawer Nav Links (for hamburger menu)
// ---------------------------------------------------------------------------

const DRAWER_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Browse Collection', path: '/products' },
  { label: 'Track Booking', path: '/track' },
  { label: 'Contact Us', path: '/contact' },
] as const;

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function CustomerHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Show back button on inner pages
  const isInnerPage = pathname !== '/';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Left — Hamburger or Back */}
          {isInnerPage ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center justify-center h-10 w-10 -ml-2 text-text hover:text-primary transition-colors"
              aria-label="Go back"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center justify-center h-10 w-10 -ml-2 text-text md:hidden"
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              </svg>
            </button>
          )}

          {/* Center — Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            {/* Crown icon */}
            <svg className="h-5 w-5 text-primary hidden sm:block" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z" />
            </svg>
            <div className="flex flex-col items-center leading-none">
              <span className="text-base sm:text-lg font-heading font-bold text-text tracking-[0.15em]">
                NAYANTARA
              </span>
              <span className="text-[8px] sm:text-[9px] tracking-[0.35em] text-primary font-medium mt-0.5">
                — RENTALS —
              </span>
            </div>
          </Link>

          {/* Right — Desktop nav + Browse button */}
          <div className="flex items-center gap-1">
            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1 mr-4">
              {DRAWER_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.path
                      ? 'text-primary'
                      : 'text-text-muted hover:text-text'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <Link
              to="/products"
              className="rounded-lg bg-primary px-4 py-2 text-xs sm:text-sm font-semibold text-background hover:opacity-90 transition-opacity"
            >
              Browse
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/60 md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 z-[61] w-72 bg-surface border-r border-border md:hidden animate-fadeIn">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex flex-col leading-none">
                <span className="text-base font-heading font-bold text-text tracking-[0.15em]">NAYANTARA</span>
                <span className="text-[8px] tracking-[0.35em] text-primary font-medium mt-0.5">— RENTALS —</span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="h-8 w-8 flex items-center justify-center text-text-muted hover:text-text"
                aria-label="Close menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Drawer Links */}
            <nav className="flex flex-col py-4">
              {DRAWER_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setDrawerOpen(false)}
                  className={cn(
                    'px-5 py-3.5 text-sm font-medium transition-colors',
                    pathname === link.path
                      ? 'text-primary bg-primary/5 border-r-2 border-primary'
                      : 'text-text-muted hover:text-text hover:bg-background'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Bottom Navigation (mobile only)
// ---------------------------------------------------------------------------

function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16">
        {BOTTOM_TABS.map((tab) => {
          const isActive = tab.path === '/'
            ? pathname === '/'
            : pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 transition-colors min-w-0',
                isActive ? 'text-primary' : 'text-text-muted'
              )}
              aria-label={tab.label}
            >
              {tab.icon(isActive)}
              <span className="text-[10px] font-medium truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Footer (desktop only — mobile uses bottom nav)
// ---------------------------------------------------------------------------

const FOOTER_LINKS = {
  Collection: [
    { label: 'Browse All', path: '/products' },
    { label: 'Categories', path: '/products' },
    { label: 'New Arrivals', path: '/products' },
  ],
  Support: [
    { label: 'Track Booking', path: '/track' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'FAQs', path: '/contact' },
  ],
  Company: [
    { label: 'About Us', path: '/' },
    { label: 'Terms of Service', path: '/' },
    { label: 'Privacy Policy', path: '/' },
  ],
} as const;

function Footer() {
  return (
    <footer className="border-t border-border bg-background hidden md:block">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-4 gap-8">
          {/* Brand Column */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z" />
              </svg>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-heading font-bold text-text tracking-[0.15em]">NAYANTARA</span>
                <span className="text-[7px] tracking-[0.35em] text-primary font-medium mt-0.5">— RENTALS —</span>
              </div>
            </Link>
            <p className="mt-4 text-sm text-text-muted leading-relaxed max-w-xs">
              Premium rental outfits for every occasion. Look your best without buying.
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
        <div className="mt-12 border-t border-border pt-8 flex items-center justify-between">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Nayantara Rentals. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Instagram', 'WhatsApp', 'Facebook'].map((name) => (
              <a
                key={name}
                href="#"
                aria-label={name}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-muted hover:text-primary hover:border-primary/40 transition-colors"
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
      <CustomerHeader />
      <main className="pt-14 sm:pt-16 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
