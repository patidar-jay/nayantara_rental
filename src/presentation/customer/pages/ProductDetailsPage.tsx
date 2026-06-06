// ============================================================================
// ProductDetailsPage — Product detail with gallery + booking widget
// ============================================================================

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct, useAvailability } from '@hooks';
import { formatCurrency, cn } from '@utils';
import BookingWidget from '../components/BookingWidget';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError, error } = useProduct(slug);
  const [selectedImage, setSelectedImage] = useState(0);

  // Availability state (managed by BookingWidget callbacks)
  const [availParams, setAvailParams] = useState<{ startDate: string; endDate: string } | null>(null);

  const { data: availability, isFetching: checkingAvailability } = useAvailability(
    availParams && product
      ? { productId: product.id, startDate: availParams.startDate, endDate: availParams.endDate }
      : null,
  );

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="aspect-[4/3] rounded-2xl skeleton" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 w-16 rounded-lg skeleton" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 w-48 skeleton rounded-lg" />
              <div className="h-6 w-32 skeleton rounded-lg" />
              <div className="h-64 rounded-2xl skeleton" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (isError || !product) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-4xl font-bold text-white">Product Not Found</h1>
          <p className="mt-3 text-gray-400">{(error as Error)?.message ?? 'This product does not exist.'}</p>
          <Link to="/products" className="mt-6 inline-block rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-500 transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const images = product.media?.length ? product.media : [];
  const currentImage = images[selectedImage]?.media_url ?? null;

  return (
    <div className="min-h-screen bg-surface-950 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-white transition-colors">Products</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link to={`/products?category=${product.category.slug}`} className="hover:text-white transition-colors">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-400 truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Images + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-surface-800">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-brand-900/40 to-surface-800 flex items-center justify-center">
                  <svg className="h-20 w-20 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 transition-all',
                      i === selectedImage ? 'ring-2 ring-brand-500' : 'ring-1 ring-white/10 opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={img.media_url} alt={img.alt_text ?? ''} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{product.name}</h1>
                {product.category && (
                  <span className="mt-2 inline-block rounded-full bg-surface-700 px-3 py-1 text-xs font-medium text-gray-300">
                    {product.category.name}
                  </span>
                )}
              </div>

              {product.description && (
                <p className="text-gray-400 leading-relaxed">{product.description}</p>
              )}

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Specifications</h3>
                  <div className="rounded-xl bg-surface-800 overflow-hidden">
                    {Object.entries(product.specifications).map(([key, value], i) => (
                      <div
                        key={key}
                        className={cn(
                          'flex justify-between px-5 py-3',
                          i % 2 === 0 ? 'bg-surface-800' : 'bg-surface-700/30'
                        )}
                      >
                        <span className="text-sm text-gray-400">{key}</span>
                        <span className="text-sm text-white font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video */}
              {product.video_url && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Video</h3>
                  <div className="aspect-video rounded-xl overflow-hidden bg-surface-800">
                    <iframe
                      src={product.video_url.replace('watch?v=', 'embed/')}
                      title={product.name}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Booking Widget (sticky) */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <BookingWidget
              product={product}
              availability={availability ?? null}
              onCheckAvailability={(startDate, endDate) => setAvailParams({ startDate, endDate })}
              isCheckingAvailability={checkingAvailability}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
