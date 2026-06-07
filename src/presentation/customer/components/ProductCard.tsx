// ============================================================================
// ProductCard — Premium product card for the customer listing grid
// Airbnb-inspired card on dark theme with hover lift animations
// ============================================================================

import { Link } from 'react-router-dom';
import type { Product, ProductMedia } from '@core/entities';
import { formatCurrency, truncate, cn } from '@utils';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProductCardProps {
  product: Product & { media?: ProductMedia[]; category?: { name: string } };
}

// ---------------------------------------------------------------------------
// Camera placeholder icon (shown when no product media is available)
// ---------------------------------------------------------------------------

function CameraIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-12 w-12 text-text-muted"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7a2 2 0 012-2h2.22a2 2 0 001.66-.9l.26-.39A2 2 0 0110.82 3h2.36a2 2 0 011.68.91l.26.39a2 2 0 001.66.9H19a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
      />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ProductCard Component
// ---------------------------------------------------------------------------

function ProductCard({ product }: ProductCardProps) {
  // Resolve the primary image from sorted media
  const primaryImage = product.media
    ?.slice()
    .sort((a, b) => a.sort_order - b.sort_order)[0];

  return (
    <Link
      to={`/products/${product.slug}`}
      className={cn(
        'group block rounded-2xl overflow-hidden bg-surface card-lift',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
      )}
      aria-label={`View details for ${product.name}`}
    >
      {/* ---------------------------------------------------------------- */}
      {/* Image Area                                                       */}
      {/* ---------------------------------------------------------------- */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage.media_url}
            alt={primaryImage.alt_text ?? product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Gradient placeholder when no media exists */
          <div className="flex h-full w-full items-center justify-center bg-surface">
            <CameraIcon />
          </div>
        )}

        {/* Category badge (top-left) */}
        {product.category?.name && (
          <span className="absolute top-3 left-3 glass rounded-full px-3 py-1 text-xs font-medium text-text-muted select-none">
            {product.category.name}
          </span>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Card Body                                                        */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex flex-col gap-2 p-5">
        {/* Product name */}
        <h3 className="text-lg font-semibold text-text line-clamp-1">
          {product.name}
        </h3>

        {/* Truncated description */}
        {product.description && (
          <p className="text-sm leading-relaxed text-text-muted line-clamp-2">
            {truncate(product.description, 80)}
          </p>
        )}

        {/* Price + Availability row */}
        <div className="mt-1 flex items-end justify-between">
          <div>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(product.rental_price_per_day)}
            </span>
            <span className="ml-1 text-sm text-text-muted">/day</span>
          </div>

          <span className="text-xs text-text-muted">
            {product.total_quantity} {product.total_quantity === 1 ? 'unit' : 'units'}
          </span>
        </div>

        {/* View Details link */}
        <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors group-hover:text-primary">
          View Details
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 translate-x-0 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export default ProductCard;
