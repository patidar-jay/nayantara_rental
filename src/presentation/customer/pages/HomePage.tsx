// ============================================================================
// HomePage — Matches reference images 1-3
// Hero + Stats + Categories + Trending + How It Works + CTA + Trust
// ============================================================================

import { Link } from 'react-router-dom';
import { useCategories, useFeaturedProducts } from '@hooks';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import TrustBadges from '../components/TrustBadges';
import { cn } from '@utils';

// ---------------------------------------------------------------------------
// Category Icons (matching reference gold outlined icons)
// ---------------------------------------------------------------------------

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  default: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    </svg>
  ),
};

// ---------------------------------------------------------------------------
// How It Works Steps
// ---------------------------------------------------------------------------

const STEPS = [
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    title: '1. Choose Outfit',
    desc: 'Browse & select your favorite outfit',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: '2. Select Date',
    desc: 'Pick your rental dates',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
    title: '3. Confirm Booking',
    desc: 'Secure your booking with easy payment',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    title: '4. Receive & Shine',
    desc: 'Get your outfit delivered & shine on your day',
  },
] as const;

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

const STATS = [
  { icon: '👤', value: '500+', label: 'Happy Customers' },
  { icon: '👗', value: '200+', label: 'Dresses' },
  { icon: '⭐', value: '4.9★', label: 'Avg. Rating' },
  { icon: '🔒', value: '100%', label: 'Secure Payments' },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HomePage() {
  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: featured, isLoading: featLoading } = useFeaturedProducts();

  return (
    <div className="animate-fadeIn">
      {/* ================================================================= */}
      {/* HERO SECTION                                                       */}
      {/* ================================================================= */}
      <section className="relative min-h-[85vh] sm:min-h-[70vh] flex items-end overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80"
            alt="Designer bridal outfit"
            className="w-full h-full object-cover object-top"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 max-w-7xl mx-auto">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/20 px-3 py-1.5 mb-4">
            <span className="text-primary text-xs">✦</span>
            <span className="text-xs text-primary font-medium">Trusted by 500+ customers</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-text leading-[1.1]">
            Rent Designer<br />Dresses<br />
            <span className="text-primary">for Every Occasion</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-text-muted max-w-md leading-relaxed">
            From bridal lehengas to party gowns — rent stunning outfits delivered to your doorstep. Look your best without buying.
          </p>

          {/* CTA Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-xs">
            <Link
              to="/products"
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
            >
              Browse Collection
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              to="/track"
              className="flex items-center justify-center gap-2 rounded-lg border border-primary/40 px-6 py-3 text-sm font-medium text-text hover:bg-primary/5 transition-colors"
            >
              Track Your Booking
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* STATS BAR                                                          */}
      {/* ================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 -mt-2 relative z-10 max-w-7xl mx-auto">
        <div className="rounded-2xl bg-surface border border-border p-4 sm:p-5">
          <div className="grid grid-cols-4 divide-x divide-border">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center px-2">
                <span className="text-lg sm:text-xl font-bold text-text">{stat.value}</span>
                <span className="text-[9px] sm:text-xs text-text-muted mt-0.5">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* BROWSE BY CATEGORY                                                 */}
      {/* ================================================================= */}
      <section className="mt-10 sm:mt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-text">Browse by Category</h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">Find the perfect outfit for your occasion</p>
          </div>
          <Link to="/products" className="text-xs sm:text-sm text-primary font-medium flex items-center gap-1 hover:opacity-80 transition-opacity shrink-0">
            View all
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {catLoading ? (
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
            {(categories ?? []).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group relative rounded-xl overflow-hidden aspect-[3/4] bg-surface border border-border card-lift"
              >
                {/* Category Image */}
                <img
                  src={cat.image_url || `https://placehold.co/300x400/1A1A24/C8A96B?text=${encodeURIComponent(cat.name)}`}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Category Icon */}
                <div className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/30">
                  {CATEGORY_ICONS.default}
                </div>

                {/* Category Info */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-sm font-semibold text-text">{cat.name}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{cat.description || 'Premium collection'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ================================================================= */}
      {/* TRENDING OUTFITS — Horizontal scroll                               */}
      {/* ================================================================= */}
      <section className="mt-10 sm:mt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-text">Trending Outfits</h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">Most loved outfits this season</p>
          </div>
          <Link to="/products" className="text-xs sm:text-sm text-primary font-medium flex items-center gap-1 hover:opacity-80 transition-opacity shrink-0">
            View all
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {featLoading ? (
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-36 sm:w-44 shrink-0">
                <ProductCardSkeleton compact />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Mobile — horizontal scroll */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 lg:hidden">
              {(featured ?? []).map((product) => (
                <div key={product.id} className="w-36 sm:w-44 shrink-0">
                  <ProductCard product={product} compact />
                </div>
              ))}
            </div>
            {/* Desktop — grid */}
            <div className="hidden lg:grid grid-cols-4 xl:grid-cols-5 gap-4">
              {(featured ?? []).slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ================================================================= */}
      {/* HOW IT WORKS                                                       */}
      {/* ================================================================= */}
      <section className="mt-10 sm:mt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-text mb-6">How It Works</h2>

        <div className="flex items-start gap-0 overflow-x-auto no-scrollbar pb-2">
          {STEPS.map((step, idx) => (
            <div key={step.title} className="flex items-start shrink-0">
              {/* Step */}
              <div className="flex flex-col items-center text-center w-28 sm:w-36">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border-2 border-primary/30 text-primary">
                  {step.icon}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-text mt-3">{step.title}</p>
                <p className="text-[10px] sm:text-xs text-text-muted mt-1 px-1">{step.desc}</p>
              </div>
              {/* Dashed connector */}
              {idx < STEPS.length - 1 && (
                <div className="flex items-center h-14 sm:h-16 mx-1 sm:mx-2">
                  <div className="w-10 sm:w-14 border-t-2 border-dashed border-primary/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/* CTA BANNER                                                         */}
      {/* ================================================================= */}
      <section className="mt-10 sm:mt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden bg-surface border border-border min-h-[220px] sm:min-h-[260px] flex items-center">
          {/* Background image */}
          <img
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=60"
            alt="Luxury outfit"
            className="absolute right-0 top-0 h-full w-1/2 object-cover object-center hidden sm:block"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/95 to-surface/30 sm:to-transparent" />

          <div className="relative z-10 p-6 sm:p-8 max-w-md">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-text leading-tight">
              Luxury Outfits,<br />
              <span className="text-primary">Unforgettable Moments</span>
            </h2>
            <p className="text-sm text-text-muted mt-2">
              Rent premium designer outfits for weddings, parties & more.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 mt-4 rounded-lg border border-primary/40 px-5 py-2.5 text-sm font-medium text-text hover:bg-primary/10 transition-colors"
            >
              Browse Collection
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* TRUST BADGES                                                       */}
      {/* ================================================================= */}
      <section className="mt-10 sm:mt-14 mb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <TrustBadges />
      </section>
    </div>
  );
}
