// ============================================================================
// ProductDetailsPage — Matches reference images 5-6
// Gallery + Thumbnails + Info + Duration picker + Sticky bottom bar
// ============================================================================

import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProduct, useAvailability } from '@hooks';
import { formatCurrency, cn } from '@utils';
import TrustBadges from '../components/TrustBadges';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError, error } = useProduct(slug);
  const [selectedImage, setSelectedImage] = useState(0);

  // Loading
  if (isLoading) {
    return (
      <div className="animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            <div className="space-y-3">
              <div className="aspect-[3/4] rounded-2xl skeleton" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 w-16 rounded-lg skeleton" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 w-24 skeleton rounded" />
              <div className="h-8 w-64 skeleton rounded" />
              <div className="h-4 w-full skeleton rounded" />
              <div className="h-10 w-32 skeleton rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (isError || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text">Product Not Found</h1>
          <p className="mt-3 text-sm text-text-muted">{(error as Error)?.message ?? 'This product does not exist.'}</p>
          <Link to="/products" className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-background hover:opacity-90 transition-opacity">
            Browse Collection
          </Link>
        </div>
      </div>
    );
  }

  const images = product.media?.length ? product.media : [];
  const currentImage = images[selectedImage]?.media_url
    ?? `https://placehold.co/600x800/1A1A24/C8A96B?text=${encodeURIComponent(product.name)}`;

  const pricePerDay = product.rental_price_per_day;

  return (
    <div className="animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* ============================================================ */}
          {/* Left Column — Gallery                                         */}
          {/* ============================================================ */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {/* Share button */}
              <button
                type="button"
                className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:text-primary transition-colors"
                aria-label="Share"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: product.name, url: window.location.href });
                  }
                }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
              </button>
              {/* Social proof */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm px-3 py-1.5">
                <span className="text-xs">🔥</span>
                <span className="text-[10px] text-white font-medium">
                  {Math.floor(Math.random() * 20) + 10} people viewed this in last 1 hour
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 transition-all',
                      i === selectedImage ? 'ring-2 ring-primary' : 'ring-1 ring-border opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={img.media_url} alt={img.alt_text ?? ''} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* Right Column — Product Info                                   */}
          {/* ============================================================ */}
          <div className="space-y-5">
            {/* Category badge */}
            {product.category && (
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {product.category.name}
              </span>
            )}

            {/* Title */}
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text leading-tight -mt-2">
              {product.name}
            </h1>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-text-muted leading-relaxed">{product.description}</p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-semibold text-text">4.8</span>
              <span className="text-xs text-text-muted">(52 reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{formatCurrency(pricePerDay)}</span>
              <span className="text-sm text-text-muted">/day</span>
            </div>

            {/* Authentic badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-4 py-2">
              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span className="text-xs font-medium text-primary">100% Authentic Designer Outfit</span>
            </div>

            {/* Rental Duration Picker */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text">Select Rental Duration</h3>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { days: 1, label: '1 Day', discount: null },
                  { days: 2, label: '2 Days', discount: 10 },
                  { days: 3, label: '3 Days', discount: 15 },
                  { days: 0, label: '4+ Days', discount: null },
                ].map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={cn(
                      'rounded-xl border py-3 px-2 text-center transition-colors',
                      idx === 0
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-text-muted hover:border-primary/40'
                    )}
                  >
                    <p className="text-xs font-medium">{opt.label}</p>
                    {opt.days > 0 ? (
                      <p className="text-xs text-primary font-semibold mt-1">
                        {formatCurrency(pricePerDay * (opt.days))}
                      </p>
                    ) : (
                      <p className="text-[10px] text-text-muted mt-1">Custom</p>
                    )}
                    {opt.discount && (
                      <p className="text-[9px] text-text-muted mt-0.5">(Save {opt.discount}%)</p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Book Now + Chat Buttons (desktop) */}
            <div className="hidden lg:flex flex-col gap-3 pt-2">
              <Link
                to={`/products/${slug}/book`}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
              >
                Book Now
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <a
                href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi, I'm interested in renting "${product.name}".`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-text hover:bg-surface transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>

            {/* Trust Info (desktop) */}
            <div className="hidden lg:block">
              <TrustBadges variant="compact" />
            </div>

            {/* Product Details Section */}
            <div className="rounded-2xl bg-surface border border-border p-5 mt-4 lg:mt-0">
              <h3 className="font-heading text-lg font-semibold text-text mb-3">Product Details</h3>
              {product.description && (
                <p className="text-sm text-text-muted leading-relaxed mb-4">{product.description}</p>
              )}
              {/* Specifications grid */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-baseline gap-2">
                      <span className="text-xs text-text-muted">•</span>
                      <span className="text-xs text-text-muted">{key}:</span>
                      <span className="text-xs text-text font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges (mobile) */}
      <div className="lg:hidden px-4 mt-6">
        <TrustBadges variant="compact" />
      </div>

      {/* ================================================================= */}
      {/* Sticky Bottom Bar (mobile)                                         */}
      {/* ================================================================= */}
      <div className="fixed bottom-16 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-md border-t border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-lg font-bold text-primary">{formatCurrency(pricePerDay)}</span>
            <span className="text-xs text-text-muted"> /day</span>
          </div>
          <Link
            to={`/products/${slug}/book`}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
          >
            Book Now
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <a
            href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi, I'm interested in "${product?.name}".`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-xs font-medium text-text"
          >
            <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat
          </a>
        </div>
      </div>

      {/* Extra padding for sticky bar */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
