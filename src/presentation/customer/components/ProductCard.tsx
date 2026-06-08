// ============================================================================
// ProductCard — Reference-accurate product card
// Shows: image with heart icon, product name, ₹price/day, ★ rating
// ============================================================================

import { Link } from 'react-router-dom';
import type { ProductWithCategory } from '@core/entities';
import { formatCurrency, cn } from '@utils';

interface ProductCardProps {
  product: ProductWithCategory;
  className?: string;
  /** If true, renders as a compact card (used in horizontal scroll) */
  compact?: boolean;
}

export default function ProductCard({ product, className, compact }: ProductCardProps) {
  // Use first media image or fallback
  const imageUrl = (product as any).media?.[0]?.media_url
    ?? `https://placehold.co/400x500/1A1A24/C8A96B?text=${encodeURIComponent(product.name)}`;

  return (
    <Link
      to={`/products/${product.slug}`}
      className={cn(
        'group block rounded-xl overflow-hidden bg-surface border border-border card-lift',
        className
      )}
    >
      {/* Image Container */}
      <div className={cn(
        'relative overflow-hidden',
        compact ? 'aspect-[3/4]' : 'aspect-[3/4]'
      )}>
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Heart/Wishlist Button (decorative) */}
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:text-primary transition-colors"
          aria-label="Add to wishlist"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      {/* Card Info */}
      <div className="p-3">
        <h3 className={cn(
          'font-medium text-text truncate',
          compact ? 'text-xs' : 'text-sm'
        )}>
          {product.name}
        </h3>

        <div className="flex items-baseline gap-1 mt-1">
          <span className={cn(
            'font-semibold text-primary',
            compact ? 'text-xs' : 'text-sm'
          )}>
            {formatCurrency(product.rental_price_per_day)}
          </span>
          <span className="text-[10px] text-text-muted">/day</span>
        </div>

        {/* Rating (static — no ratings table yet) */}
        <div className="flex items-center gap-1 mt-1">
          <svg className="h-3 w-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-[10px] text-text-muted">
            4.{Math.floor(Math.random() * 3) + 6}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

export function ProductCardSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div className="rounded-xl overflow-hidden bg-surface border border-border">
      <div className={cn('skeleton', compact ? 'aspect-[3/4]' : 'aspect-[3/4]')} />
      <div className="p-3 space-y-2">
        <div className="h-3.5 w-3/4 skeleton rounded" />
        <div className="h-3 w-1/2 skeleton rounded" />
        <div className="h-2.5 w-1/3 skeleton rounded" />
      </div>
    </div>
  );
}
