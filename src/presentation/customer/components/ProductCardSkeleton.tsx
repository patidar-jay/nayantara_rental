// ============================================================================
// ProductCardSkeleton — Loading placeholder for ProductCard
// Mirrors the exact dimensions/layout of ProductCard for a seamless transition
// ============================================================================

// ---------------------------------------------------------------------------
// Single Skeleton Card
// ---------------------------------------------------------------------------

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-surface-800">
      {/* Image area placeholder */}
      <div className="skeleton aspect-[4/3] rounded-none" />

      {/* Body */}
      <div className="flex flex-col gap-3 p-5">
        {/* Title */}
        <div className="skeleton h-5 w-3/4" />

        {/* Description line 1 */}
        <div className="skeleton h-4 w-full" />
        {/* Description line 2 */}
        <div className="skeleton h-4 w-2/3" />

        {/* Price + availability row */}
        <div className="mt-1 flex items-end justify-between">
          <div className="skeleton h-6 w-24" />
          <div className="skeleton h-4 w-14" />
        </div>

        {/* View Details link */}
        <div className="mt-2 skeleton h-4 w-28" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton Grid — renders `count` skeleton cards in a responsive grid
// ---------------------------------------------------------------------------

interface ProductCardSkeletonGridProps {
  /** Number of skeleton cards to render (default: 6) */
  count?: number;
}

export function ProductCardSkeletonGrid({
  count = 6,
}: ProductCardSkeletonGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default ProductCardSkeleton;
