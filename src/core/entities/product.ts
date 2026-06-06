// ============================================================================
// Product Entity
// Represents a rentable product with pricing and inventory
// Maps to: products table
// ============================================================================

export type ProductStatus = 'active' | 'inactive';

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  specifications: Record<string, string> | null;
  rental_price_per_day: number;
  total_quantity: number;
  status: ProductStatus;
  video_url: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductInsert {
  category_id: string;
  name: string;
  slug: string;
  description?: string | null;
  specifications?: Record<string, string> | null;
  rental_price_per_day: number;
  total_quantity: number;
  status?: ProductStatus;
  video_url?: string | null;
  is_featured?: boolean;
  sort_order?: number;
}

export interface ProductUpdate {
  category_id?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  specifications?: Record<string, string> | null;
  rental_price_per_day?: number;
  total_quantity?: number;
  status?: ProductStatus;
  video_url?: string | null;
  is_featured?: boolean;
  sort_order?: number;
  updated_at?: string;
}

// ============================================================================
// Product Media Entity
// Stores image URLs for a product (multiple images per product)
// Maps to: product_media table
// ============================================================================

export type MediaType = 'image';

export interface ProductMedia {
  id: string;
  product_id: string;
  media_url: string;
  media_type: MediaType;
  sort_order: number;
  alt_text: string | null;
  created_at: string;
}

export interface ProductMediaInsert {
  product_id: string;
  media_url: string;
  media_type?: MediaType;
  sort_order?: number;
  alt_text?: string | null;
}

export interface ProductMediaUpdate {
  media_url?: string;
  sort_order?: number;
  alt_text?: string | null;
}

// ============================================================================
// Product with Relations (join queries)
// ============================================================================

export interface ProductWithCategory extends Product {
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ProductWithMedia extends Product {
  media: ProductMedia[];
}

export interface ProductDetail extends Product {
  category: {
    id: string;
    name: string;
    slug: string;
  };
  media: ProductMedia[];
}
