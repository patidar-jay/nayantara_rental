// ============================================================================
// HomePage — Customer landing page with live data
// ============================================================================

import { Link } from 'react-router-dom';
import { useFeaturedProducts, useCategories } from '@hooks';
import { formatCurrency, cn } from '@utils';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeletonGrid } from '../components/ProductCardSkeleton';

// ---------------------------------------------------------------------------
// Static Content
// ---------------------------------------------------------------------------

const BENEFITS = [
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Premium Collection',
    description: 'Every dress is professionally dry-cleaned, inspected, and perfectly maintained before each rental.',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z" />
      </svg>
    ),
    title: 'Visit Our Store',
    description: 'Walk in to our store, try on outfits in person, and pick the perfect look for your occasion.',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Transparent Pricing',
    description: 'No hidden fees. Simple per-day pricing with upfront total calculations before you book.',
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    title: '24/7 Support',
    description: 'Round-the-clock support via phone and WhatsApp. We\'re always here to help.',
  },
];

const CATEGORY_EMOJIS: Record<string, string> = {
  'lehenga': '👗',
  'saree': '🥻',
  'gown': '✨',
  'sherwani': '🤵',
  'suit': '👔',
  'bridal': '💍',
  'kids': '🧒',
  'accessories': '👜',
  'jewellery': '💎',
  'western': '👠',
  'ethnic': '🪷',
  'party-wear': '🎉',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HomePage() {
  const { data: featuredProducts, isLoading: loadingFeatured } = useFeaturedProducts(6);
  const { data: categories, isLoading: loadingCategories } = useCategories();

  return (
    <div>
      {/* ================================================================== */}
      {/* Hero Section                                                        */}
      {/* ================================================================== */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-soft" />
            <span className="text-xs font-medium text-primary">Trusted by 500+ customers</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-text leading-tight">
            Rent Designer Dresses
            <br />
            <span className="gradient-text">for Every Occasion</span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg text-text-muted leading-relaxed">
            From bridal lehengas to party gowns — rent stunning outfits delivered to your doorstep. Look your best without buying. Simple booking, transparent pricing.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-text hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              Browse Collection
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              to="/track"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-sm font-semibold text-text-muted hover:bg-surface hover:text-text transition-all"
            >
              Track Your Booking
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-text">500+</p>
              <p className="text-xs text-text-muted mt-1">Happy Customers</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-text">200+</p>
              <p className="text-xs text-text-muted mt-1">Dresses</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-text">4.9★</p>
              <p className="text-xs text-text-muted mt-1">Avg Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* Categories Section                                                   */}
      {/* ================================================================== */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text">Browse by Category</h2>
            <p className="mt-3 text-text-muted max-w-lg mx-auto">
              Find the perfect outfit for your occasion
            </p>
          </div>

          {loadingCategories ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-surface p-6 text-center skeleton h-32" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {(categories ?? []).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="group rounded-2xl bg-surface p-6 text-center hover:bg-surface transition-all card-lift"
                >
                  <span className="text-3xl block mb-3">
                    {CATEGORY_EMOJIS[cat.slug] ?? '📦'}
                  </span>
                  <h3 className="text-sm font-semibold text-text group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================================================================== */}
      {/* Featured Products                                                    */}
      {/* ================================================================== */}
      <section className="py-20 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-accent-500/10 border border-accent-500/20 px-3 py-1 mb-3">
                <span className="text-xs font-medium text-accent-400">⭐ Featured</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-text">Trending Outfits</h2>
              <p className="mt-2 text-text-muted">Most rented dresses this month</p>
            </div>
            <Link
              to="/products"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary transition-colors"
            >
              View all
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {loadingFeatured ? (
            <ProductCardSkeletonGrid count={6} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featuredProducts ?? []).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Mobile view-all link */}
          <div className="mt-8 text-center sm:hidden">
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary transition-colors"
            >
              View all products →
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* Benefits Section                                                     */}
      {/* ================================================================== */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text">Why Choose Nayantara?</h2>
            <p className="mt-3 text-text-muted max-w-lg mx-auto">
              We make renting designer outfits easy, reliable, and affordable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl bg-surface p-6 transition-all hover:bg-surface/60"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary mb-4">
                  {b.icon}
                </div>
                <h3 className="text-base font-semibold text-text mb-2">{b.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* Contact CTA                                                          */}
      {/* ================================================================== */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 sm:px-16 text-center">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-text">
                Ready to Rent?
              </h2>
              <p className="mt-4 text-lg text-text/80 max-w-lg mx-auto">
                Get in touch or browse our collection to find your perfect outfit.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-background hover:bg-surface transition-colors"
                >
                  Browse Collection
                </Link>
                <a
                  href="tel:+919876543210"
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-sm font-semibold text-text hover:bg-surface transition-colors"
                >
                  📞 Call Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
